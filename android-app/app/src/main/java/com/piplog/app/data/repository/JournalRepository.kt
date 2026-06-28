package com.piplog.app.data.repository

import com.piplog.app.data.model.JournalEntry
import com.piplog.app.data.supabase.SupabaseProvider
import io.github.jan.supabase.postgrest.query.Order

class JournalRepository {

    suspend fun getAllEntries(userId: String): Result<List<JournalEntry>> {
        return try {
            val entries = SupabaseProvider.postgrest[SupabaseProvider.JOURNAL_TABLE]
                .select {
                    filter { eq("user_id", userId) }
                    order("entry_date", order = Order.DESCENDING)
                }
                .decodeList<JournalEntry>()
            Result.success(entries)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getEntryById(entryId: String): Result<JournalEntry?> {
        return try {
            val entry = SupabaseProvider.postgrest[SupabaseProvider.JOURNAL_TABLE]
                .select {
                    filter { eq("id", entryId) }
                    limit(1)
                }
                .decodeSingleOrNull<JournalEntry>()
            Result.success(entry)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getEntriesByDate(userId: String, date: String): Result<List<JournalEntry>> {
        return try {
            val entries = SupabaseProvider.postgrest[SupabaseProvider.JOURNAL_TABLE]
                .select {
                    filter {
                        eq("user_id", userId)
                        eq("entry_date", date)
                    }
                    order("created_at", order = Order.DESCENDING)
                }
                .decodeList<JournalEntry>()
            Result.success(entries)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getLatestEntry(userId: String): Result<JournalEntry?> {
        return try {
            val entry = SupabaseProvider.postgrest[SupabaseProvider.JOURNAL_TABLE]
                .select {
                    filter { eq("user_id", userId) }
                    order("entry_date", order = Order.DESCENDING)
                    limit(1)
                }
                .decodeSingleOrNull<JournalEntry>()
            Result.success(entry)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun insertEntry(entry: JournalEntry): Result<JournalEntry> {
        return try {
            val result = SupabaseProvider.postgrest[SupabaseProvider.JOURNAL_TABLE]
                .insert(entry) {
                    select()
                }
                .decodeSingle<JournalEntry>()
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateEntry(entryId: String, title: String, content: String): Result<Unit> {
        return try {
            SupabaseProvider.postgrest[SupabaseProvider.JOURNAL_TABLE]
                .update({
                    set("title", title)
                    set("content", content)
                }) {
                    filter { eq("id", entryId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteEntry(entryId: String): Result<Unit> {
        return try {
            SupabaseProvider.postgrest[SupabaseProvider.JOURNAL_TABLE]
                .delete {
                    filter { eq("id", entryId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
