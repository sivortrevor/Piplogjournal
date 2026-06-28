package com.piplog.app.ui.screens.trades

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.piplog.app.data.model.Constants
import com.piplog.app.ui.components.GlassCard
import com.piplog.app.ui.components.ResultBadge
import com.piplog.app.ui.components.SectionHeader
import com.piplog.app.ui.theme.*
import com.piplog.app.utils.TradeUtils
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TradeDetailScreen(
    tradeId: String,
    onNavigateBack: () -> Unit,
    viewModel: TradeDetailViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(tradeId) {
        viewModel.loadTrade(tradeId)
    }

    val trade = uiState.trade

    if (uiState.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Primary)
        }
    } else if (trade == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("Trade not found", color = MutedText)
        }
    } else {
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
                Spacer(modifier = Modifier.weight(1f))
                IconButton(onClick = { /* Edit */ }) {
                    Icon(Icons.Filled.Edit, contentDescription = "Edit")
                }
            }

            // Trade header card
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = trade.pair,
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.ExtraBold
                            )
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (trade.isBuy) ProfitBackground else LossBackground
                                ) {
                                    Text(
                                        text = " ${trade.side.uppercase()} ",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = if (trade.isBuy) Profit else Loss,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                if (trade.result != null) {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    ResultBadge(
                                        result = trade.result,
                                        isWin = trade.isWin,
                                        isLoss = trade.isLoss
                                    )
                                }
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = trade.pnl?.let { TradeUtils.formatCurrency(it) } ?: "Open",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.ExtraBold,
                                color = when {
                                    (trade.pnl ?: 0.0) > 0 -> Profit
                                    (trade.pnl ?: 0.0) < 0 -> Loss
                                    else -> OnSurface
                                }
                            )
                            trade.pips?.let { pips ->
                                Text(
                                    text = "${if (pips > 0) "+" else ""}${String.format("%.1f", pips)} pips",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MutedText
                                )
                            }
                        }
                    }

                    // Date info
                    val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.US)
                    val openedDate = try {
                        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(trade.openedAt)
                            ?.let { dateFormat.format(it) } ?: trade.openedAt
                    } catch (e: Exception) { trade.openedAt }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(24.dp)
                    ) {
                        Column {
                            Text(
                                text = "OPENED",
                                style = MaterialTheme.typography.labelSmall,
                                color = MutedText
                            )
                            Text(
                                text = openedDate,
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        trade.closedAt?.let { closed ->
                            Column {
                                Text(
                                    text = "CLOSED",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MutedText
                                )
                                val closedDate = try {
                                    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(closed)
                                        ?.let { dateFormat.format(it) } ?: closed
                                } catch (e: Exception) { closed }
                                Text(
                                    text = closedDate,
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Trade details
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    SectionHeader(
                        title = "Trade Details",
                        icon = { Icon(Icons.Filled.AttachMoney, contentDescription = null, tint = Primary) }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    TradeDetailRow("Entry Price", TradeUtils.formatCurrency(trade.entryPrice))
                    trade.exitPrice?.let { TradeDetailRow("Exit Price", TradeUtils.formatCurrency(it)) }
                    TradeDetailRow("Lot Size", trade.lotSize.toString())

                    trade.stopLoss?.let { TradeDetailRow("Stop Loss", TradeUtils.formatCurrency(it)) }
                    trade.takeProfit?.let { TradeDetailRow("Take Profit", TradeUtils.formatCurrency(it)) }
                    trade.rrRatio?.let { TradeDetailRow("R:R", "1 : ${String.format("%.2f", it)}") }
                }
            }

            // Strategy
            (if (trade.strategy != null) trade.strategy else trade.session)?.let { _ ->
                Spacer(modifier = Modifier.height(16.dp))
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        SectionHeader(
                            title = "Strategy",
                            icon = { Icon(Icons.Filled.TipsAndUpdates, contentDescription = null, tint = Primary) }
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        trade.strategy?.let { TradeDetailRow("Strategy", it) }
                        trade.session?.let {
                            TradeDetailRow("Session", it.replaceFirstChar { it.uppercase() })
                        }
                        trade.confidence?.let { TradeDetailRow("Confidence", "$it / 5") }
                    }
                }
            }

            // Psychology
            if (trade.emotionBefore != null || trade.emotionAfter != null || !trade.mistakes.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        SectionHeader(
                            title = "Psychology",
                            icon = { Icon(Icons.Filled.Psychology, contentDescription = null, tint = Primary) }
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        trade.emotionBefore?.let { TradeDetailRow("Before", it) }
                        trade.emotionAfter?.let { TradeDetailRow("After", it) }

                        trade.mistakes?.let { mistakeList ->
                            if (mistakeList.isNotEmpty()) {
                                Text(
                                    text = "MISTAKES",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MutedText,
                                    modifier = Modifier.padding(top = 12.dp)
                                )
                                FlowRow(
                                    modifier = Modifier.padding(top = 8.dp).fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    mistakeList.forEach { mistake ->
                                        Surface(
                                            shape = RoundedCornerShape(50),
                                            color = LossBackground
                                        ) {
                                            Text(
                                                text = " $mistake ",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = Loss
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Notes
            if (!trade.notes.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(16.dp))
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        SectionHeader(
                            title = "Notes",
                            icon = { Icon(Icons.Filled.EditNote, contentDescription = null, tint = Primary) }
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = trade.notes,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Delete button
            OutlinedButton(
                onClick = { /* Delete trade */ },
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = LossBackground,
                    contentColor = Loss
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Filled.Delete, contentDescription = null)
                Text(" Delete Trade")
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun TradeDetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = MutedText
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}
