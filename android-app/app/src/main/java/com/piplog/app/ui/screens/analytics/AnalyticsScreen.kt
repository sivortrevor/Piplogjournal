package com.piplog.app.ui.screens.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.piplog.app.ui.components.GlassCard
import com.piplog.app.ui.components.SectionHeader
import com.piplog.app.ui.theme.*
import com.piplog.app.utils.TradeUtils
import com.piplog.app.utils.Constants
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AnalyticsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToTrades: () -> Unit,
    onNavigateToJournal: () -> Unit,
    viewModel: AnalyticsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadData("current-user-id")
    }

    val closedTrades = uiState.trades.filter { it.result != null && it.result != "open" }
    val wins = closedTrades.filter { it.result == "win" }
    val losses = closedTrades.filter { it.result == "loss" }

    val netPnl = uiState.trades.sumOf { it.pnl ?: 0.0 }
    val winRate = if (closedTrades.isNotEmpty()) wins.size.toDouble() / closedTrades.size * 100 else 0.0

    val avgWin = if (wins.isNotEmpty()) wins.map { it.pnl ?: 0.0 }.average() else 0.0
    val avgLoss = if (losses.isNotEmpty()) losses.map { it.pnl ?: 0.0 }.average() else 0.0
    val grossProfit = wins.sumOf { it.pnl ?: 0.0 }
    val grossLoss = losses.sumOf { (it.pnl ?: 0.0).coerceAtMost(0.0) }

    val grossLossAbs = grossLoss.let { kotlin.math.abs(it) }
    val profitFactor = if (grossLossAbs != 0.0) grossProfit / grossLossAbs else if (grossProfit > 0) Double.POSITIVE_INFINITY else 0.0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Analytics",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "Deep performance insights",
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedText
                )
            }
        }

        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxWidth().height(200.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Primary)
            }
        } else if (uiState.trades.isEmpty()) {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(Icons.Filled.BarChart, contentDescription = null, tint = Primary, modifier = Modifier.size(64.dp))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("No data yet", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
                    Text(
                        text = "Log a few trades to unlock insights",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MutedText,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        } else {
            // Performance Metrics
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    SectionHeader(
                        title = "Performance Metrics",
                        icon = { Icon(Icons.Filled.Insights, contentDescription = null, tint = Primary) }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Grid of metrics
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        MetricPill("Trades", "${uiState.trades.size}", Modifier.weight(1f))
                        MetricPill("Win Rate", "${winRate.toInt()}%", Modifier.weight(1f))
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        MetricPill("Avg Win", TradeUtils.formatCurrency(avgWin), Modifier.weight(1f), StatTone.POSITIVE)
                        MetricPill("Avg Loss", TradeUtils.formatCurrency(avgLoss), Modifier.weight(1f), StatTone.NEGATIVE)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        MetricPill(
                            "Profit Factor",
                            if (profitFactor.isInfinite() || profitFactor > 99) "∞" else String.format("%.2f", profitFactor),
                            Modifier.weight(1f)
                        )
                        MetricPill("Net P/L", TradeUtils.formatCurrency(netPnl), Modifier.weight(1f),
                            if (netPnl >= 0) StatTone.POSITIVE else StatTone.NEGATIVE)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Recent trades
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        SectionHeader(
                            title = "Recent Trades",
                            icon = { Icon(Icons.Filled.History, contentDescription = null, tint = Primary) }
                        )
                        TextButton(onClick = onNavigateToTrades) {
                            Text("See all", color = Primary, style = MaterialTheme.typography.labelMedium)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    closedTrades.sortedByDescending { it.openedAt }.take(4).forEach { trade ->
                        RecentTradeRow(trade)
                        if (trade != closedTrades.sortedByDescending { it.openedAt }.take(4).last()) {
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Session performance
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    SectionHeader(
                        title = "Session Performance",
                        icon = { Icon(Icons.Filled.Schedule, contentDescription = null, tint = Primary) }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    val sessions = mapOf(
                        "Asia" to uiState.trades.filter { it.session?.lowercase() == "asia" },
                        "London" to uiState.trades.filter { it.session?.lowercase() == "london" },
                        "New York" to uiState.trades.filter { it.session?.lowercase() == "new_york" },
                        "Other" to uiState.trades.filter { it.session?.lowercase() == "other" }
                    )

                    sessions.forEach { (name, trades) ->
                        if (trades.isNotEmpty()) {
                            val pnl = trades.sumOf { it.pnl ?: 0.0 }
                            SessionBar(name, pnl, trades.size)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Journal preview
            uiState.latestNote?.let { note ->
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            SectionHeader(
                                title = "Latest Note",
                                icon = { Icon(Icons.Filled.MenuBook, contentDescription = null, tint = Primary) }
                            )
                            TextButton(onClick = onNavigateToJournal) {
                                Text("View all", color = Primary, style = MaterialTheme.typography.labelMedium)
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(note.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(
                            text = note.content.ifBlank { "No content yet" },
                            style = MaterialTheme.typography.bodySmall,
                            color = MutedText,
                            maxLines = 3,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                        Text(
                            text = SimpleDateFormat("MMM dd, yyyy", Locale.US).format(
                                try { SimpleDateParse("yyyy-MM-dd").parse(note.entryDate) ?: Date() } catch (e: Exception) { Date() }
                            ),
                            style = MaterialTheme.typography.labelSmall,
                            color = MutedText,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }
            }

            // Win/Loss chart (simplified)
            Spacer(modifier = Modifier.height(16.dp))
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    SectionHeader(
                        title = "Wins vs Losses",
                        icon = { Icon(Icons.Filled.PieChart, contentDescription = null, tint = Primary) }
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        StatCircle("Wins", wins.size, Profit, wins.size + losses.size)
                        StatCircle("Losses", losses.size, Loss, wins.size + losses.size)
                    }

                    if (closedTrades.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = String.format("%.0f%% win rate", winRate),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MutedText,
                            modifier = Modifier.align(Alignment.CenterHorizontally)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun MetricPill(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    tone: StatTone = StatTone.NEUTRAL
) {
    Surface(
        modifier = modifier.clip(RoundedCornerShape(12.dp)),
        color = SurfaceVariant
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = label.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = MutedText
            )
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.ExtraBold,
                color = when (tone) {
                    StatTone.POSITIVE -> Profit
                    StatTone.NEGATIVE -> Loss
                    StatTone.NEUTRAL -> OnSurface
                },
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

enum class StatTone { POSITIVE, NEGATIVE, NEUTRAL }

@Composable
fun RecentTradeRow(trade: com.piplog.app.data.model.Trade) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp)),
        color = if ((trade.pnl ?: 0.0) >= 0) ProfitBackground.copy(alpha = 0.5f) else LossBackground.copy(alpha = 0.5f)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (trade.isBuy) ProfitBackground else LossBackground
            ) {
                Box(
                    modifier = Modifier.size(40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = trade.side.uppercase().take(4),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = if (trade.isBuy) Profit else Loss
                    )
                }
            }
            Column(modifier = Modifier.weight(1f).padding(horizontal = 12.dp)) {
                Text(trade.pair, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Text(
                    text = try {
                        SimpleDateFormat("MMM dd", Locale.US).format(
                            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(trade.openedAt)!!
                        )
                    } catch (e: Exception) { trade.openedAt.substring(0, 10) },
                    style = MaterialTheme.typography.labelSmall,
                    color = MutedText
                )
            }
            Text(
                text = trade.pnl?.let { TradeUtils.formatCurrency(it) } ?: "---",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = if ((trade.pnl ?: 0.0) >= 0) Profit else Loss
            )
        }
    }
}

@Composable
fun SessionBar(name: String, pnl: Double, count: Int) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Text("%d trades".format(count), style = MaterialTheme.typography.labelSmall, color = MutedText)
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            TradeUtils.formatCurrency(pnl),
            style = MaterialTheme.typography.labelMedium,
            color = if (pnl >= 0) Profit else Loss,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun StatCircle(label: String, value: Int, color: Color, total: Int) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier.size(80.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = value.toString(),
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color = color
            )
        }
        Text(label, style = MaterialTheme.typography.labelSmall, color = MutedText)
    }
}

// Helper for date parsing
fun SimpleDateParse(pattern: String): SimpleDateFormat = SimpleDateFormat(pattern, Locale.getDefault())
