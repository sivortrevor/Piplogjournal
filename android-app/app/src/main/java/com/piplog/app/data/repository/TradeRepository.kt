package com.piplog.app.data.repository

import com.piplog.app.data.model.Trade
import com.piplog.app.data.supabase.SupabaseProvider
import io.github.jan.supabase.postgrest.query.Order

class TradeRepository {

    suspend fun getAllTrades(userId: String): Result<List<Trade>> {
        return try {
            val trades = SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .select {
                    filter { eq("user_id", userId) }
                    order("opened_at", order = Order.DESCENDING)
                }
                .decodeList<Trade>()
            Result.success(trades)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTradeById(tradeId: String): Result<Trade?> {
        return try {
            val trade = SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .select {
                    filter { eq("id", tradeId) }
                    limit(1)
                }
                .decodeSingleOrNull<Trade>()
            Result.success(trade)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTradesByDateRange(
        userId: String,
        startDate: String,
        endDate: String
    ): Result<List<Trade>> {
        return try {
            val trades = SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .select {
                    filter {
                        eq("user_id", userId)
                        gte("opened_at", startDate)
                        lte("opened_at", endDate)
                    }
                    order("opened_at", order = Order.DESCENDING)
                }
                .decodeList<Trade>()
            Result.success(trades)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun insertTrade(trade: Trade): Result<Trade> {
        return try {
            val result = SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .insert(trade) {
                    select()
                }
                .decodeSingle<Trade>()
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateTrade(tradeId: String, updates: Map<String, Any?>): Result<Unit> {
        return try {
            SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .update({
                    updates.forEach { (key, value) ->
                        when (value) {
                            null -> set(key, null as Any?)
                            is String -> set(key, value)
                            is Number -> set(key, value)
                            is Boolean -> set(key, value)
                            is List<*> -> set(key, value)
                            else -> set(key, value)
                        }
                    }
                }) {
                    filter { eq("id", tradeId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteTrade(tradeId: String): Result<Unit> {
        return try {
            SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .delete {
                    filter { eq("id", tradeId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uploadScreenshot(userId: String, fileName: String, bytes: ByteArray): Result<String> {
        return try {
            val path = "$userId/${System.currentTimeMillis()}_$fileName"
            SupabaseProvider.storage[SupabaseProvider.SCREENSHOTS_BUCKET]
                .upload(path, bytes)
            Result.success(path)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getScreenshotUrl(path: String): String {
        return SupabaseProvider.storage[SupabaseProvider.SCREENSHOTS_BUCKET].publicUrl(path)
    }

    suspend fun searchTrades(userId: String, query: String): Result<List<Trade>> {
        return try {
            val trades = SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .select {
                    filter {
                        eq("user_id", userId)
                        ilike("pair", "%$query%")
                    }
                    order("opened_at", order = Order.DESCENDING)
                }
                .decodeList<Trade>()
            Result.success(trades)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTradesByResult(userId: String, result: String): Result<List<Trade>> {
        return try {
            val trades = SupabaseProvider.postgrest[SupabaseProvider.TRADES_TABLE]
                .select {
                    filter {
                        eq("user_id", userId)
                        eq("result", result)
                    }
                    order("opened_at", order = Order.DESCENDING)
                }
                .decodeList<Trade>()
            Result.success(trades)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
