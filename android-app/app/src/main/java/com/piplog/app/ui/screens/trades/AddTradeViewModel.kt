package com.piplog.app.ui.screens.trades

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.piplog.app.data.model.Trade
import com.piplog.app.data.repository.TradeRepository
import com.piplog.app.utils.TradeUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID

data class AddTradeUiState(
    val isSaving: Boolean = false,
    val error: String? = null,
    val savedTradeId: String? = null
)

class AddTradeViewModel(
    private val tradeRepository: TradeRepository = TradeRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(AddTradeUiState())
    val uiState: StateFlow<AddTradeUiState> = _uiState.asStateFlow()

    fun saveTrade(
        userId: String,
        pair: String,
        side: String,
        lotSize: Double,
        entryPrice: Double,
        exitPrice: Double?,
        stopLoss: Double?,
        takeProfit: Double?,
        strategy: String?,
        session: String,
        confidence: Int,
        emotionBefore: String?,
        emotionAfter: String?,
        mistakes: List<String>,
        notes: String?,
        pnl: Double?,
        rrRatio: Double?,
        onSuccess: (tradeId: String) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true, error = null) }

            val now = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US)
                .format(java.util.Date())

            val calculatedPips = if (entryPrice != 0.0 && exitPrice != null) {
                TradeUtils.calculatePips(pair, side, entryPrice, exitPrice)
            } else null

            val result = TradeUtils.determineResult(pnl)

            val trade = Trade(
                id = UUID.randomUUID().toString(),
                userId = userId,
                pair = pair,
                side = side,
                lotSize = lotSize,
                entryPrice = entryPrice,
                exitPrice = exitPrice,
                stopLoss = stopLoss,
                takeProfit = takeProfit,
                rrRatio = rrRatio,
                pips = calculatedPips,
                pnl = pnl,
                result = result,
                strategy = strategy,
                session = session,
                confidence = confidence,
                emotionBefore = emotionBefore,
                emotionAfter = emotionAfter,
                mistakes = mistakes.ifEmpty { null },
                notes = notes,
                openedAt = now,
                closedAt = if (exitPrice != null) now else null,
                createdAt = now,
                updatedAt = now
            )

            tradeRepository.insertTrade(trade).fold(
                onSuccess = { savedTrade ->
                    _uiState.update { it.copy(isSaving = false, savedTradeId = savedTrade.id) }
                    onSuccess(savedTrade.id)
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isSaving = false, error = error.message ?: "Failed to save trade") }
                }
            )
        }
    }
}
