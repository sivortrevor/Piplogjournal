package com.piplog.app.ui.screens.dashboard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.piplog.app.ui.components.*
import com.piplog.app.ui.theme.*
import com.piplog.app.utils.TradeUtils
import co.yml.charts.common.model.Point
import co.yml.charts.axis.AxisData
import co.yml.charts.ui.linechart.LineChart
import co.yml.charts.ui.linechart.model.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToAddTrade: () -> Unit,
    onNavigateToTrades: () -> Unit,
    onNavigateToAnalytics: () -> Unit,
    onNavigateToCalendar: () -> Unit,
    onNavigateToJournal: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToProfile: () -> Unit,
    viewModel: DashboardViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showMenu by remember { mutableStateOf(false) }
    val today = remember {
        SimpleDateFormat("EEEE, MMMM d", Locale.getDefault()).format(Date())
    }
    val greeting = remember {
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        when {
            hour < 12 -> "Good morning"
            hour < 18 -> "Good afternoon"
            else -> "Good evening"
        }
    }
    val quote = remember {
        val quotes = listOf(
            "Protect capital first. Profits follow.",
            "Discipline beats conviction.",
            "The market rewards patience.",
            "Risk less, win more.",
            "Plan the trade, trade the plan."
        )
        quotes[Calendar.getInstance().get(Calendar.DAY_OF_MONTH) % quotes.size]
    }

    LaunchedEffect(Unit) {
        // Load data - userId would come from auth state
        viewModel.loadData("current-user-id")
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(start = 16.dp, end = 16.dp, top = 16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                IconButton(onClick = { showMenu = true }) {
                    Icon(Icons.Outlined.Menu, contentDescription = "Menu")
                }

                DropdownMenu(
                    expanded = showMenu,
                    onDismissRequest = { showMenu = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Settings") },
                        onClick = {
                            showMenu = false
                            onNavigateToSettings()
                        },
                        leadingIcon = { Icon(Icons.Outlined.Settings, contentDescription = null) }
                    )
                    DropdownMenuItem(
                        text = { Text("Sign out") },
                        onClick = {
                            showMenu = false
                        },
                        leadingIcon = { Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null) }
                    )
                }
            }

            PipLogLogo(size = 36.dp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Greeting tile
        GlassCard(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = today.uppercase(),
                    style = MaterialTheme.typography.labelSmall,
                    color = MutedText,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "$greeting, ${uiState.profile?.displayName ?: "TRADER"}",
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Row(
                    modifier = Modifier.padding(top = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Filled.AutoAwesome,
                        contentDescription = null,
                        tint = Primary,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = " $quote",
                        style = MaterialTheme.typography.bodySmall,
                        color = MutedText,
                        modifier = Modifier.padding(start = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Account overview
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "ACCOUNT BALANCE",
                        style = MaterialTheme.typography.labelSmall,
                        color = MutedText
                    )
                    val growth = uiState.metrics?.growth ?: 0.0
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = if (growth >= 0) ProfitBackground else LossBackground
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                if (growth >= 0) Icons.Filled.TrendingUp else Icons.Filled.TrendingDown,
                                contentDescription = null,
                                tint = if (growth >= 0) Profit else Loss,
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "${if (growth >= 0) "+" else ""}%.2f%%".format(growth),
                                style = MaterialTheme.typography.labelSmall,
                                color = if (growth >= 0) Profit else Loss,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Text(
                    text = TradeUtils.formatCurrency(uiState.metrics?.balance ?: 10000.0),
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.padding(top = 4.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatPill(
                        label = "Net P/L",
                        value = TradeUtils.formatCurrency(uiState.metrics?.netPnl ?: 0.0),
                        tone = if ((uiState.metrics?.netPnl ?: 0.0) >= 0) StatTone.POSITIVE else StatTone.NEGATIVE,
                        modifier = Modifier.weight(1f)
                    )
                    StatPill(
                        label = "Today",
                        value = TradeUtils.formatCurrency(uiState.metrics?.todayPnl ?: 0.0),
                        tone = when {
                            (uiState.metrics?.todayPnl ?: 0.0) > 0 -> StatTone.POSITIVE
                            (uiState.metrics?.todayPnl ?: 0.0) < 0 -> StatTone.NEGATIVE
                            else -> StatTone.NEUTRAL
                        },
                        modifier = Modifier.weight(1f)
                    )
                    StatPill(
                        label = "Drawdown",
                        value = "%.1f%%".format(uiState.metrics?.currentDrawdown ?: 0.0),
                        tone = if ((uiState.metrics?.currentDrawdown ?: 0.0) <= -5) StatTone.NEGATIVE else StatTone.NEUTRAL,
                        modifier = Modifier.weight(1f)
                    )
                }

                // Equity chart placeholder
                if (uiState.equityCurve.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                            .padding(top = 16.dp)
                    ) {
                        EquityLineChart(
                            data = uiState.equityCurve.map { it.equity },
                            labels = uiState.equityCurve.map {
                                SimpleDateFormat("MMM dd", Locale.US).format(Date(it.timestamp))
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            QuickActionButton(
                icon = Icons.Filled.Add,
                label = "Add",
                isPrimary = true,
                onClick = onNavigateToAddTrade,
                modifier = Modifier.weight(1f)
            )
            QuickActionButton(
                icon = Icons.Filled.History,
                label = "History",
                onClick = onNavigateToTrades,
                modifier = Modifier.weight(1f)
            )
            QuickActionButton(
                icon = Icons.Outlined.BarChart,
                label = "Calendar",
                onClick = onNavigateToCalendar,
                modifier = Modifier.weight(1f)
            )
            QuickActionButton(
                icon = Icons.Filled.MenuBook,
                label = "Journal",
                onClick = onNavigateToJournal,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Weekly goal
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "WEEKLY GOAL",
                            style = MaterialTheme.typography.labelSmall,
                            color = MutedText
                        )
                        Row(modifier = Modifier.padding(top = 4.dp), verticalAlignment = Alignment.Bottom) {
                            Text(
                                text = TradeUtils.formatCurrency(uiState.metrics?.weeklyPnl ?: 0.0),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.ExtraBold,
                                color = if ((uiState.metrics?.weeklyPnl ?: 0.0) >= 0) Profit else Loss
                            )
                            Text(
                                text = " / ${TradeUtils.formatCurrency(500.0)}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MutedText
                            )
                        }
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "DAYS",
                            style = MaterialTheme.typography.labelSmall,
                            color = MutedText
                        )
                        Text(
                            text = "${uiState.metrics?.weeklyDays ?: 0}/7",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }

                val weeklyProgress = ((uiState.metrics?.weeklyPnl ?: 0.0) / 500.0 * 100).coerceIn(0.0, 100.0)
                LinearProgressIndicator(
                    progress = weeklyProgress.toFloat() / 100f,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .padding(top = 16.dp),
                    color = Primary,
                    trackColor = SurfaceVariant
                )

                Text(
                    text = "%.0f%% to weekly target".format(weeklyProgress),
                    style = MaterialTheme.typography.labelSmall,
                    color = MutedText,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun EquityLineChart(
    data: List<Double>,
    labels: List<String>
) {
    val maxDataValue = data.maxOrNull() ?: return
    val minDataValue = data.minOrNull() ?: return

    val pointsData = data.mapIndexed { index, value ->
        Point(index.toFloat(), value.toFloat())
    }

    val lineChartData = LineChartData(
        linePlotData = LinePlotData(
            lines = listOf(
                    Line(
                        dataPoints = pointsData,
                        lineStyle = LineStyle(
                            color = Primary,
                            lineType = LineType.SmoothCurve()
                        ),
                        intersectionPoint = IntersectionPoint(
                            color = Primary
                        ),
                        selectionHighlightPoint = SelectionHighlightPoint(
                            color = Primary
                        ),
                        selectionHighlightPopUp = SelectionHighlightPopUp()
                    )
            )
        ),
        xAxisData = AxisData.Builder()
            .axisLabelColor(MutedText)
            .axisLineColor(Color.Transparent)
            .steps(pointsData.size - 1)
            .labelData { index -> labels.getOrElse(index) { "" } }
            .labelAndAxisLinePadding(10.dp)
            .build(),
        yAxisData = AxisData.Builder()
            .axisLabelColor(MutedText)
            .axisLineColor(Color.Transparent)
            .steps(5)
            .labelData { index -> "" }
            .labelAndAxisLinePadding(10.dp)
            .build(),
        backgroundColor = Color.Transparent
    )

    LineChart(
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp),
        lineChartData = lineChartData
    )
}

@Composable
fun QuickActionButton(
    icon: ImageVector,
    label: String,
    isPrimary: Boolean = false,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(if (isPrimary) Primary else SurfaceVariant)
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (isPrimary) Color.White else OnSurface,
            modifier = Modifier.size(20.dp)
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = if (isPrimary) Color.White else OnSurface,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}
