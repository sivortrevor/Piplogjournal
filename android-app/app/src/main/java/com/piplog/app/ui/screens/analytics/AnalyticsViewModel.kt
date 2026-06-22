package com.piplog.app.ui.screens.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.piplog.app.data.model.Trade
import com.piplog.app.data.model.JournalEntry
import com.piplog.app.data.repository.TradeRepository
import com.piplog.app.data.repository.JournalRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AnalyticsUiState(
    val isLoading: Boolean = true,
    val trades: List<Trade> = emptyList(),
    val latestNote: JournalEntry? = null,
    val error: String? = null
)

class AnalyticsViewModel(
    private val tradeRepository: TradeRepository = TradeRepository(),
    private val journalRepository: JournalRepository = JournalRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(AnalyticsUiState())
    val uiState: StateFlow<AnalyticsUiState> = _uiState.asStateFlow()

    fun loadData(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            val tradesResult = tradeRepository.getAllTrades(userId)
            val noteResult = journalRepository.getLatestEntry(userId)

            tradesResult.fold(
                onSuccess = { trades ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            trades = trades,
                            latestNote = noteResult.getOrNull()
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, error = error.message) }
                }
            )
        }
    }
}
