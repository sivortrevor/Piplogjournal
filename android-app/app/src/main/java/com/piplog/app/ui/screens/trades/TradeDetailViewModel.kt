package com.piplog.app.ui.screens.trades

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.piplog.app.data.model.Trade
import com.piplog.app.data.repository.TradeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class TradeDetailUiState(
    val isLoading: Boolean = true,
    val trade: Trade? = null,
    val error: String? = null
)

class TradeDetailViewModel(
    private val tradeRepository: TradeRepository = TradeRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(TradeDetailUiState())
    val uiState: StateFlow<TradeDetailUiState> = _uiState.asStateFlow()

    fun loadTrade(tradeId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            tradeRepository.getTradeById(tradeId).fold(
                onSuccess = { trade ->
                    _uiState.update { it.copy(isLoading = false, trade = trade) }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, error = error.message) }
                }
            )
        }
    }

    fun deleteTrade(tradeId: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            tradeRepository.deleteTrade(tradeId).fold(
                onSuccess = { onSuccess() },
                onFailure = { error ->
                    _uiState.update { it.copy(error = error.message) }
                }
            )
        }
    }
}
