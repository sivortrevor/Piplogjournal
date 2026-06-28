package com.piplog.app.data.repository

import com.piplog.app.data.model.Profile
import com.piplog.app.data.supabase.SupabaseProvider
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.status.SessionStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

data class AuthState(
    val isLoggedIn: Boolean = false,
    val userId: String? = null,
    val email: String? = null,
    val displayName: String? = null,
    val isLoading: Boolean = true,
    val error: String? = null
)

class AuthRepository {

    val sessionStatus: Flow<SessionStatus> = SupabaseProvider.auth.sessionStatus

    val currentUserId: String?
        get() = SupabaseProvider.auth.currentUserOrNull()?.id

    suspend fun signInWithEmail(email: String, password: String): Result<Unit> {
        return try {
            SupabaseProvider.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signUpWithEmail(email: String, password: String, displayName: String?): Result<Unit> {
        return try {
            SupabaseProvider.auth.signUpWith(Email) {
                this.email = email
                this.password = password
                this.data = buildJsonObject {
                    displayName?.let { put("display_name", it) }
                }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signInWithGoogle(): Result<Unit> {
        return try {
            // Placeholder for Google Sign-In logic
            // In a real app, you'd use the native Google Sign-In SDK then pass the ID token to Supabase
            // Result.success(Unit)
            Result.failure(Exception("Google Sign-In not implemented"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signOut(): Result<Unit> {
        return try {
            SupabaseProvider.auth.signOut()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun resetPassword(email: String): Result<Unit> {
        return try {
            SupabaseProvider.auth.resetPasswordForEmail(email)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updatePassword(newPassword: String): Result<Unit> {
        return try {
            SupabaseProvider.auth.updateUser {
                this.password = newPassword
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProfile(userId: String): Result<Profile?> {
        return try {
            val profile = SupabaseProvider.postgrest[SupabaseProvider.PROFILES_TABLE]
                .select {
                    filter { eq("id", userId) }
                    limit(1)
                }
                .decodeSingleOrNull<Profile>()
            Result.success(profile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateProfile(userId: String, displayName: String?, avatarUrl: String?): Result<Unit> {
        return try {
            SupabaseProvider.postgrest[SupabaseProvider.PROFILES_TABLE]
                .update({
                    displayName?.let { set("display_name", it) }
                    avatarUrl?.let { set("avatar_url", it) }
                }) {
                    filter { eq("id", userId) }
                }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCurrentSession(): AuthState {
        val session = SupabaseProvider.auth.currentSessionOrNull()
        val user = session?.user
        return if (user != null) {
            val profile = getProfile(user.id).getOrNull()
            AuthState(
                isLoggedIn = true,
                userId = user.id,
                email = user.email,
                displayName = profile?.displayName ?: user.email?.substringBefore("@"),
                isLoading = false
            )
        } else {
            AuthState(isLoading = false)
        }
    }
}
