package com.piplog.app.utils

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToInt

object TradeUtils {

    private val JPY_PAIRS = setOf("USDJPY", "EURJPY", "GBPJPY", "AUDJPY", "NZDJPY", "CADJPY", "CHFJPY")

    fun getPipSize(pair: String): Double {
        val normalized = pair.replace(Regex("[^A-Z]"), "").uppercase()
        return when {
            normalized == "XAUUSD" || normalized == "GOLD" -> 0.1
            normalized == "BTCUSD" || normalized == "ETHUSD" -> 1.0
            normalized in JPY_PAIRS -> 0.01
            else -> 0.0001
        }
    }

    fun getPipValuePerLot(pair: String): Double {
        val normalized = pair.replace(Regex("[^A-Z]"), "").uppercase()
        return when {
            normalized == "XAUUSD" || normalized == "GOLD" -> 10.0
            normalized == "BTCUSD" -> 1.0
            normalized == "ETHUSD" -> 1.0
            normalized in JPY_PAIRS -> 9.3
            else -> 10.0
        }
    }

    fun calculatePips(pair: String, side: String, entry: Double, exit: Double): Double {
        if (entry == 0.0 || exit == 0.0) return 0.0
        val pipSize = getPipSize(pair)
        val diff = if (side.equals("buy", ignoreCase = true)) exit - entry else entry - exit
        return (diff / pipSize * 10).roundToInt() / 10.0
    }

    fun calculatePnl(pair: String, side: String, entry: Double, exit: Double, lotSize: Double): Double {
        if (entry == 0.0 || exit == 0.0 || lotSize == 0.0) return 0.0
        val pips = calculatePips(pair, side, entry, exit)
        val pipValue = getPipValuePerLot(pair)
        return (pips * lotSize * pipValue * 100).roundToInt() / 100.0
    }

    fun calculateRR(entry: Double, stopLoss: Double?, takeProfit: Double?, side: String): Double? {
        if (entry == 0.0 || stopLoss == null || takeProfit == null) return null
        val risk = if (side.equals("buy", ignoreCase = true)) entry - stopLoss else stopLoss - entry
        val reward = if (side.equals("buy", ignoreCase = true)) takeProfit - entry else entry - takeProfit
        if (risk <= 0) return null
        return (reward / risk * 100).roundToInt() / 100.0
    }

    fun determineResult(pnl: Double?): String {
        if (pnl == null) return "open"
        return when {
            pnl > 0.01 -> "win"
            pnl < -0.01 -> "loss"
            else -> "breakeven"
        }
    }

    fun formatCurrency(value: Double, currency: String = "USD"): String {
        val format = NumberFormat.getCurrencyInstance(Locale.US)
        format.currency = java.util.Currency.getInstance(currency)
        return format.format(value)
    }

    fun formatPips(value: Double): String {
        val sign = if (value > 0) "+" else ""
        return "$sign${value.toFixed(1)} pips"
    }

    private fun Double.toFixed(digits: Int): String = String.format(Locale.US, "%.${digits}f", this)
}

data class DashboardMetrics(
    val balance: Double,
    val netPnl: Double,
    val growth: Double,
    val todayPnl: Double,
    val winRate: Double,
    val currentDrawdown: Double,
    val maxDrawdown: Double,
    val avgRR: Double,
    val streak: Int,
    val streakType: String?, // "win" or "loss"
    val closedTradeCount: Int,
    val weeklyPnl: Double,
    val weeklyDays: Int
)

data class EquityPoint(
    val timestamp: Long,
    val equity: Double
)

fun calculateDashboardMetrics(trades: List<com.piplog.app.data.model.Trade>): DashboardMetrics {
    val closed = trades.filter { it.result != null && it.result != "open" }
    val wins = closed.filter { it.result == "win" }
    val losses = closed.filter { it.result == "loss" }

    val netPnl = trades.sumOf { it.pnl ?: 0.0 }
    val balance = Constants.STARTING_BALANCE + netPnl
    val growth = (netPnl / Constants.STARTING_BALANCE) * 100

    val today = System.currentTimeMillis()
    val todayStart = today - (today % (24 * 60 * 60 * 1000))
    val todayPnl = trades.filter {
        val openedTime = try {
            java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(it.openedAt)?.time ?: 0L
        } catch (e: Exception) { 0L }
        openedTime >= todayStart
    }.sumOf { it.pnl ?: 0.0 }

    val winRate = if (closed.isNotEmpty()) (wins.size.toDouble() / closed.size) * 100 else 0.0

    // Calculate drawdown
    var running = Constants.STARTING_BALANCE
    var peak = Constants.STARTING_BALANCE
    var maxDD = 0.0
    trades.sortedBy { it.openedAt }.forEach { trade ->
        running += trade.pnl ?: 0.0
        peak = maxOf(peak, running)
        val dd = ((running - peak) / peak) * 100
        if (dd < maxDD) maxDD = dd
    }
    val currentDD = ((running - peak) / peak) * 100

    // Average RR
    val rrTrades = closed.filter { it.rrRatio != null }
    val avgRR = if (rrTrades.isNotEmpty()) rrTrades.map { it.rrRatio!! }.average() else 0.0

    // Streak
    var streak = 0
    var streakType: String? = null
    for (trade in closed.sortedByDescending { it.openedAt }) {
        val r = trade.result ?: continue
        if (r == "breakeven") continue
        if (streakType == null) streakType = r
        if (r == streakType) streak++
        else break
    }

    // Weekly metrics
    val weekStart = getStartOfWeekMillis()
    val weekTrades = trades.filter {
        try {
            java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(it.openedAt)?.time ?: 0L >= weekStart
        } catch (e: Exception) { false }
    }
    val weeklyPnl = weekTrades.sumOf { it.pnl ?: 0.0 }
    val weekDays = weekTrades.map {
        try {
            java.text.SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(it.openedAt.substring(0, 10))?.time ?: 0L
        } catch (e: Exception) { 0L }
    }.distinct().size

    return DashboardMetrics(
        balance = balance,
        netPnl = netPnl,
        growth = growth,
        todayPnl = todayPnl,
        winRate = winRate,
        currentDrawdown = currentDD,
        maxDrawdown = maxDD,
        avgRR = avgRR,
        streak = streak,
        streakType = streakType,
        closedTradeCount = closed.size,
        weeklyPnl = weeklyPnl,
        weeklyDays = weekDays
    )
}

fun calculateEquityCurve(trades: List<com.piplog.app.data.model.Trade>): List<EquityPoint> {
    val sorted = trades.sortedBy { it.openedAt }
    var running = Constants.STARTING_BALANCE
    return sorted.map { trade ->
        running += trade.pnl ?: 0.0
        EquityPoint(
            timestamp = try {
                java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(trade.openedAt)?.time ?: 0L
            } catch (e: Exception) { 0L },
            equity = running
        )
    }
}

private fun getStartOfWeekMillis(): Long {
    val cal = java.util.Calendar.getInstance()
    cal.set(java.util.Calendar.DAY_OF_WEEK, cal.getFirstDayOfWeek())
    cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
    cal.set(java.util.Calendar.MINUTE, 0)
    cal.set(java.util.Calendar.SECOND, 0)
    cal.set(java.util.Calendar.MILLISECOND, 0)
    return cal.timeInMillis
}

object Constants {
    const val STARTING_BALANCE = 10000.0
}
