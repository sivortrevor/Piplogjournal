package com.piplog.app.data.supabase

import com.piplog.app.BuildConfig
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.storage.storage

object SupabaseProvider {
    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL.ifEmpty { "https://placeholder.supabase.co" },
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY.ifEmpty { "placeholder-key" }
        ) {
            install(Auth)
            install(Postgrest)
            install(Storage)
        }
    }

    val auth: Auth by lazy { client.auth }
    val postgrest: Postgrest by lazy { client.postgrest }
    val storage: Storage by lazy { client.storage }

    const val TRADES_TABLE = "trades"
    const val PROFILES_TABLE = "profiles"
    const val JOURNAL_TABLE = "journal_entries"
    const val SCREENSHOTS_BUCKET = "trade-screenshots"
}
