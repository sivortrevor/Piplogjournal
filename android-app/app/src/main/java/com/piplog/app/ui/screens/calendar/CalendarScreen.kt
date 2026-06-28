package com.piplog.app.ui.screens.calendar

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.piplog.app.ui.theme.*
import com.piplog.app.utils.TradeUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.text.SimpleDateFormat
import java.util.*

data class CalendarDay(
    val date: Date,
    val pnl: Double = 0.0,
    val tradeCount: Int = 0,
    val dateKey: String
)

data class CalendarUiState(
    val isLoading: Boolean = true,
    val days: List<CalendarDay> = emptyList(),
    val selectedDate: CalendarDay? = null,
    val selectedDayTrades: List<com.piplog.app.data.model.Trade> = emptyList()
)

@Composable
fun CalendarScreen(
    onNavigateBack: () -> Unit,
    onNavigateToTrades: () -> Unit,
    viewModel: CalendarViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val currentMonth = remember { mutableStateOf(Calendar.getInstance()) }

    LaunchedEffect(Unit) {
        viewModel.loadCalendar("current-user-id")
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
            Text(
                text = "Calendar",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold
            )
        }

        // Month navigation
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = {
                currentMonth.value.add(Calendar.MONTH, -1)
            }) {
                Icon(Icons.Filled.ChevronLeft, contentDescription = "Previous month")
            }

            val monthFormat = SimpleDateFormat("MMMM yyyy", Locale.US)
            Text(
                text = monthFormat.format(currentMonth.value.time).uppercase(),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            IconButton(onClick = {
                currentMonth.value.add(Calendar.MONTH, 1)
            }) {
                Icon(Icons.Filled.ChevronRight, contentDescription = "Next month")
            }
        }

        // Weekday labels
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            listOf("S", "M", "T", "W", "T", "F", "S").forEach { day ->
                Text(
                    text = day,
                    style = MaterialTheme.typography.labelSmall,
                    color = MutedText,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.width(40.dp)
                )
            }
        }

        // Calendar grid
        val calendar = currentMonth.value.clone() as Calendar
        calendar.set(Calendar.DAY_OF_MONTH, 1)
        val firstDayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1
        val daysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)

        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            for (week in 0..5) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    for (dayOfWeek in 0..6) {
                        val dayIndex = week * 7 + dayOfWeek - firstDayOfWeek + 1

                        if (dayIndex in 1..daysInMonth) {
                            calendar.set(Calendar.DAY_OF_MONTH, dayIndex)
                            val dateKey = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(calendar.time)
                            val dayData = uiState.days.find { it.dateKey == dateKey }

                            CalendarDayCell(
                                day = dayIndex,
                                pnl = dayData?.pnl ?: 0.0,
                                tradeCount = dayData?.tradeCount ?: 0,
                                isSelected = uiState.selectedDate?.dateKey == dateKey,
                                onClick = {
                                    viewModel.selectDate(dateKey)
                                }
                            )
                        } else {
                            Box(modifier = Modifier.size(40.dp))
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Selected day info
        uiState.selectedDate?.let { selected ->
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = SurfaceVariant
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    val dateFormat = SimpleDateFormat("EEEE, MMMM d", Locale.US)
                    Text(
                        text = dateFormat.format(selected.date),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Trades", style = MaterialTheme.typography.labelSmall, color = MutedText)
                            Text("${selected.tradeCount}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("P/L", style = MaterialTheme.typography.labelSmall, color = MutedText)
                            Text(
                                TradeUtils.formatCurrency(selected.pnl),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (selected.pnl >= 0) Profit else Loss
                            )
                        }
                    }

                    if (uiState.selectedDayTrades.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(16.dp))
                        ElevatedButton(
                            onClick = onNavigateToTrades,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("View ${uiState.selectedDayTrades.size} trades")
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Month summary
        val monthDays = uiState.days.filter { day ->
            val cal = Calendar.getInstance()
            cal.time = day.date
            cal.get(Calendar.MONTH) == currentMonth.value.get(Calendar.MONTH) &&
            cal.get(Calendar.YEAR) == currentMonth.value.get(Calendar.YEAR)
        }
        val monthPnl = monthDays.sumOf { it.pnl }
        val monthTrades = monthDays.sumOf { it.tradeCount }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                color = SurfaceVariant
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Month P/L", style = MaterialTheme.typography.labelSmall, color = MutedText)
                    Text(
                        TradeUtils.formatCurrency(monthPnl),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (monthPnl >= 0) Profit else Loss
                    )
                }
            }
            Surface(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                color = SurfaceVariant
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Total Trades", style = MaterialTheme.typography.labelSmall, color = MutedText)
                    Text("$monthTrades", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.ExtraBold)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
fun CalendarDayCell(
    day: Int,
    pnl: Double,
    tradeCount: Int,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val bgColor = when {
        isSelected -> Primary
        pnl > 0 -> Profit.copy(alpha = 0.2f)
        pnl < 0 -> Loss.copy(alpha = 0.2f)
        else -> SurfaceVariant
    }

    Box(
        modifier = Modifier
            .size(40.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = day.toString(),
                style = MaterialTheme.typography.labelMedium,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) PrimaryContainer else OnSurface
            )
            if (tradeCount > 0) {
                Box(
                    modifier = Modifier
                        .size(4.dp)
                        .clip(CircleShape)
                        .background(if (pnl >= 0) Profit else Loss)
                )
            }
        }
    }
}

class CalendarViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(CalendarUiState())
    val uiState: StateFlow<CalendarUiState> = _uiState.asStateFlow()

    fun loadCalendar(userId: String) {
        _uiState.update { it.copy(isLoading = false) }
    }

    fun selectDate(dateKey: String) {
        _uiState.update { it.copy(selectedDate = CalendarDay(Date(0), 0.0, 0, dateKey)) }
    }
}
