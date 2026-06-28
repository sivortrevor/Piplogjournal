package com.piplog.app.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.piplog.app.data.repository.AuthRepository
import com.piplog.app.data.repository.AuthState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoggedIn: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null,
    val email: String? = null,
    val displayName: String? = null
)

class AuthViewModel(
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        checkSession()
    }

    private fun checkSession() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val state = authRepository.getCurrentSession()
            _uiState.update {
                it.copy(
                    isLoggedIn = state.isLoggedIn,
                    isLoading = false,
                    email = state.email,
                    displayName = state.displayName,
                    error = state.error
                )
            }
        }
    }

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = authRepository.signInWithEmail(email, password)
            result.fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false, isLoggedIn = true) }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, error = error.message ?: "Login failed") }
                }
            )
        }
    }

    fun signUp(email: String, password: String, displayName: String?) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = authRepository.signUpWithEmail(email, password, displayName)
            result.fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false, isLoggedIn = true) }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, error = error.message ?: "Registration failed") }
                }
            )
        }
    }

    fun signInWithGoogle() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = authRepository.signInWithGoogle()
            result.fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false) }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, error = error.message ?: "Google sign-in failed") }
                }
            )
        }
    }

    fun resetPassword(email: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = authRepository.resetPassword(email)
            result.fold(
                onSuccess = {
                    _uiState.update { it.copy(isLoading = false, error = "Password reset email sent!") }
                },
                onFailure = { error ->
                    _uiState.update { it.copy(isLoading = false, error = error.message ?: "Failed to send reset email") }
                }
            )
        }
    }

    fun signOut() {
        viewModelScope.launch {
            authRepository.signOut()
            _uiState.update { AuthUiState() }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
