package com.piplog.app.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.piplog.app.data.model.Trade
import com.piplog.app.data.model.Profile
import com.piplog.app.data.repository.TradeRepository
import com.piplog.app.data.repository.AuthRepository
import com.piplog.app.utils.DashboardMetrics
import com.piplog.app.utils.EquityPoint
import com.piplog.app.utils.calculateDashboardMetrics
import com.piplog.app.utils.calculateEquityCurve
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class DashboardUiState(
    val isLoading: Boolean = true,
    val trades: List<Trade> = emptyList(),
    val profile: Profile? = null,
    val metrics: DashboardMetrics? = null,
    val equityCurve: List<EquityPoint> = emptyList(),
    val error: String? = null
)

class DashboardViewModel(
    private val tradeRepository: TradeRepository = TradeRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    fun loadData(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            val profileResult = authRepository.getProfile(userId)
            val tradesResult = tradeRepository.getAllTrades(userId)

            if (tradesResult.isFailure) {
                _uiState.update { it.copy(isLoading = false, error = tradesResult.exceptionOrNull()?.message) }
                return@launch
            }

            val trades = tradesResult.getOrNull() ?: emptyList()
            val profile = profileResult.getOrNull()
            val metrics = calculateDashboardMetrics(trades)
            val equityCurve = calculateEquityCurve(trades)

            _uiState.update {
                it.copy(
                    isLoading = false,
                    trades = trades,
                    profile = profile,
                    metrics = metrics,
                    equityCurve = equityCurve
                )
            }
        }
    }

    fun refresh(userId: String) {
        loadData(userId)
    }
}
