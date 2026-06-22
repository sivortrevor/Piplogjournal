package com.piplog.app.data.model

import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Profile(
    val id: String,
    @SerialName("display_name")
    val displayName: String? = null,
    val email: String? = null,
    @SerialName("avatar_url")
    val avatarUrl: String? = null,
    @SerialName("subscription_plan")
    val subscriptionPlan: String = "free",
    @SerialName("preferred_currency")
    val preferredCurrency: String = "USD",
    @SerialName("created_at")
    val createdAt: String,
    @SerialName("updated_at")
    val updatedAt: String
)

@Serializable
data class Trade(
    val id: String,
    @SerialName("user_id")
    val userId: String,
    val pair: String,
    val side: String,
    @SerialName("lot_size")
    val lotSize: Double = 0.0,
    @SerialName("entry_price")
    val entryPrice: Double = 0.0,
    @SerialName("exit_price")
    val exitPrice: Double? = null,
    @SerialName("stop_loss")
    val stopLoss: Double? = null,
    @SerialName("take_profit")
    val takeProfit: Double? = null,
    @SerialName("risk_percent")
    val riskPercent: Double? = null,
    @SerialName("reward_percent")
    val rewardPercent: Double? = null,
    @SerialName("rr_ratio")
    val rrRatio: Double? = null,
    val pips: Double? = null,
    val pnl: Double? = null,
    val result: String? = null,
    val strategy: String? = null,
    val session: String? = null,
    val confidence: Int? = null,
    @SerialName("emotion_before")
    val emotionBefore: String? = null,
    @SerialName("emotion_after")
    val emotionAfter: String? = null,
    val mistakes: List<String>? = null,
    val notes: String? = null,
    @SerialName("screenshot_url")
    val screenshotUrl: String? = null,
    @SerialName("opened_at")
    val openedAt: String,
    @SerialName("closed_at")
    val closedAt: String? = null,
    @SerialName("created_at")
    val createdAt: String,
    @SerialName("updated_at")
    val updatedAt: String
) {
    val isWin: Boolean get() = result == "win"
    val isLoss: Boolean get() = result == "loss"
    val isOpen: Boolean get() = result == "open" || result == null
    val isBuy: Boolean get() = side.equals("buy", ignoreCase = true)
}

@Serializable
data class JournalEntry(
    val id: String,
    @SerialName("user_id")
    val userId: String,
    val title: String,
    val content: String = "",
    @SerialName("entry_type")
    val entryType: String = "daily",
    @SerialName("entry_date")
    val entryDate: String,
    @SerialName("created_at")
    val createdAt: String,
    @SerialName("updated_at")
    val updatedAt: String
) {
    companion object {
        val ENTRY_TYPES = listOf("daily", "weekly", "lesson", "goal", "reflection")
    }
}

enum class TradeSide { BUY, SELL }
enum class TradeResult { WIN, LOSS, BREAKEVEN, OPEN }
enum class TradingSession { ASIA, LONDON, NEW_YORK, OTHER }

object Constants {
    val POPULAR_PAIRS = listOf(
        "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD",
        "EURJPY", "GBPJPY", "EURGBP", "AUDJPY", "EURAUD", "GBPAUD", "XAUUSD", "BTCUSD"
    )

    val STRATEGIES = listOf(
        "Breakout", "Trend Following", "Reversal", "Range", "News", "Scalp",
        "Swing", "Order Block", "Supply/Demand", "ICT", "SMC", "Other"
    )

    val EMOTIONS = listOf(
        "Calm", "Confident", "Excited", "Fearful", "Greedy", "Anxious",
        "Frustrated", "Patient", "Disciplined", "Impulsive", "Tired"
    )

    val COMMON_MISTAKES = listOf(
        "FOMO entry", "No stop loss", "Moved stop loss", "Risked too much",
        "Overtraded", "Revenge trade", "Ignored plan", "Closed too early",
        "Held too long", "No setup confirmation"
    )

    const val STARTING_BALANCE = 10000.0
}
