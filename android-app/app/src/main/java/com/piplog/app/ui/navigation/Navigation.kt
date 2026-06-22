package com.piplog.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.piplog.app.ui.screens.auth.LoginScreen
import com.piplog.app.ui.screens.auth.RegisterScreen
import com.piplog.app.ui.screens.auth.ForgotPasswordScreen
import com.piplog.app.ui.screens.dashboard.DashboardScreen
import com.piplog.app.ui.screens.trades.AddTradeScreen
import com.piplog.app.ui.screens.trades.TradesListScreen
import com.piplog.app.ui.screens.trades.TradeDetailScreen
import com.piplog.app.ui.screens.analytics.AnalyticsScreen
import com.piplog.app.ui.screens.calendar.CalendarScreen
import com.piplog.app.ui.screens.journal.JournalScreen
import com.piplog.app.ui.screens.profile.ProfileScreen
import com.piplog.app.ui.screens.settings.SettingsScreen

sealed class Screen(val route: String) {
    data object Auth : Screen("auth")
    data object Login : Screen("login")
    data object Register : Screen("register")
    data object ForgotPassword : Screen("forgot_password")
    data object Dashboard : Screen("dashboard")
    data object AddTrade : Screen("add_trade")
    data object Trades : Screen("trades")
    data object TradeDetail : Screen("trade_detail/{tradeId}") {
        fun createRoute(tradeId: String) = "trade_detail/$tradeId"
    }
    data object Analytics : Screen("analytics")
    data object Calendar : Screen("calendar")
    data object Journal : Screen("journal")
    data object Profile : Screen("profile")
    data object Settings : Screen("settings")
}

@Composable
fun PipLogNavHost(
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Auth screens
        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                onNavigateToForgotPassword = { navController.navigate(Screen.ForgotPassword.route) },
                onLoginSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                onNavigateToLogin = { navController.popBackStack() },
                onRegisterSuccess = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBack = { navController.popBackStack() }
            )
        }

        // Main app screens
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onNavigateToAddTrade = { navController.navigate(Screen.AddTrade.route) },
                onNavigateToTrades = { navController.navigate(Screen.Trades.route) },
                onNavigateToAnalytics = { navController.navigate(Screen.Analytics.route) },
                onNavigateToCalendar = { navController.navigate(Screen.Calendar.route) },
                onNavigateToJournal = { navController.navigate(Screen.Journal.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) }
            )
        }

        composable(Screen.AddTrade.route) {
            AddTradeScreen(
                onNavigateBack = { navController.popBackStack() },
                onTradeSaved = { tradeId ->
                    navController.navigate(Screen.TradeDetail.createRoute(tradeId)) {
                        popUpTo(Screen.Dashboard.route)
                    }
                }
            )
        }

        composable(Screen.Trades.route) {
            TradesListScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToAddTrade = { navController.navigate(Screen.AddTrade.route) },
                onNavigateToTradeDetail = { tradeId ->
                    navController.navigate(Screen.TradeDetail.createRoute(tradeId))
                }
            )
        }

        composable(Screen.TradeDetail.route) { backStackEntry ->
            val tradeId = backStackEntry.arguments?.getString("tradeId") ?: ""
            TradeDetailScreen(
                tradeId = tradeId,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Analytics.route) {
            AnalyticsScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToTrades = { navController.navigate(Screen.Trades.route) },
                onNavigateToJournal = { navController.navigate(Screen.Journal.route) }
            )
        }

        composable(Screen.Calendar.route) {
            CalendarScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToTrades = { navController.navigate(Screen.Trades.route) }
            )
        }

        composable(Screen.Journal.route) {
            JournalScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() },
                onSignOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
