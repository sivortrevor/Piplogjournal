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

data class TradesListUiState(
    val isLoading: Boolean = true,
    val trades: List<Trade> = emptyList(),
    val error: String? = null
)

class TradesListViewModel(
    private val tradeRepository: TradeRepository = TradeRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(TradesListUiState())
    val uiState: StateFlow<TradesListUiState> = _uiState.asStateFlow()

    fun loadTrades(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            tradeRepository.getAllTrades(userId).fold(
                onSuccess = { trades ->
                    _uiState.update { it.copy(isLoading = false, trades = trades) }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, error = error.message) }
                }
            )
        }
    }
}
