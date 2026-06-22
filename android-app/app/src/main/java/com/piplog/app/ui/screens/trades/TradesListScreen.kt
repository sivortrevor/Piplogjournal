package com.piplog.app.ui.screens.trades

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.piplog.app.data.model.Trade
import com.piplog.app.ui.components.GlassCard
import com.piplog.app.ui.components.PrimaryButton
import com.piplog.app.ui.components.ResultBadge
import com.piplog.app.ui.theme.*
import com.piplog.app.utils.TradeUtils
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TradesListScreen(
    onNavigateBack: () -> Unit,
    onNavigateToAddTrade: () -> Unit,
    onNavigateToTradeDetail: (tradeId: String) -> Unit,
    viewModel: TradesListViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var filterResult by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        viewModel.loadTrades("current-user-id")
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
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
                    text = "Trades",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "${uiState.trades.size} trades",
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedText
                )
            }
            Button(
                onClick = onNavigateToAddTrade,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary
                )
            ) {
                Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Text(" New")
            }
        }

        // Search
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by pair...") },
            leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            singleLine = true
        )

        // Filters
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("all", "win", "loss").forEach { f ->
                FilterChip(
                    selected = (filterResult == null && f == "all") || filterResult == f,
                    onClick = { filterResult = if (f == "all") null else f },
                    label = { Text(f.replaceFirstChar { it.uppercase() }) }
                )
            }
        }

        // Trades list
        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Primary)
            }
        } else if (uiState.trades.isEmpty()) {
            EmptyTradesState(onAddTrade = onNavigateToAddTrade)
        } else {
            val filteredTrades = uiState.trades
                .filter { trade ->
                    (searchQuery.isBlank() || trade.pair.contains(searchQuery, ignoreCase = true)) &&
                    (filterResult == null || trade.result == filterResult)
                }

            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                items(filteredTrades) { trade ->
                    TradeListItem(
                        trade = trade,
                        onClick = { onNavigateToTradeDetail(trade.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun TradeListItem(
    trade: Trade,
    onClick: () -> Unit
) {
    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Side indicator
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = if (trade.isBuy) ProfitBackground else LossBackground
            ) {
                Box(
                    modifier = Modifier.size(44.dp),
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

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = trade.pair,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    if (trade.result != null) {
                        Spacer(modifier = Modifier.width(8.dp))
                        ResultBadge(
                            result = trade.result,
                            isWin = trade.isWin,
                            isLoss = trade.isLoss
                        )
                    }
                }
                val date = try {
                    SimpleDateFormat("MMM dd, HH:mm", Locale.US)
                        .format(SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(trade.openedAt)!!)
                } catch (e: Exception) { trade.openedAt }
                Text(
                    text = date,
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedText
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = trade.pnl?.let { TradeUtils.formatCurrency(it) } ?: "---",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = when {
                        (trade.pnl ?: 0.0) > 0 -> Profit
                        (trade.pnl ?: 0.0) < 0 -> Loss
                        else -> MutedText
                    }
                )
                Text(
                    text = trade.pips?.let { "${if (it > 0) "+" else ""}${"%.1f".format(it)} pips" } ?: "open",
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedText
                )
            }

            Icon(
                Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = MutedText
            )
        }
    }
}

@Composable
fun EmptyTradesState(onAddTrade: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Surface(
                shape = RoundedCornerShape(32.dp),
                color = SurfaceVariant
            ) {
                Box(
                    modifier = Modifier.size(64.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Filled.Inbox,
                        contentDescription = null,
                        tint = MutedText,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "No trades yet",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Log your first trade to start building your edge.",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedText
            )

            Spacer(modifier = Modifier.height(24.dp))

            PrimaryButton(
                text = "Add first trade",
                onClick = onAddTrade
            )
        }
    }
}
