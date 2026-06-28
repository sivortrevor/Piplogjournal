package com.piplog.app.ui.screens.trades

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.rememberAsyncImagePainter
import com.piplog.app.data.model.Constants
import com.piplog.app.ui.components.*
import com.piplog.app.ui.theme.*
import com.piplog.app.utils.TradeUtils

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun AddTradeScreen(
    onNavigateBack: () -> Unit,
    onTradeSaved: (tradeId: String) -> Unit,
    viewModel: AddTradeViewModel = viewModel()
) {
    var pair by remember { mutableStateOf("EURUSD") }
    var side by remember { mutableStateOf("buy") }
    var lotSize by remember { mutableStateOf("") }
    var entryPrice by remember { mutableStateOf("") }
    var exitPrice by remember { mutableStateOf("") }
    var stopLoss by remember { mutableStateOf("") }
    var takeProfit by remember { mutableStateOf("") }
    var strategy by remember { mutableStateOf("") }
    var session by remember { mutableStateOf("london") }
    var confidence by remember { mutableIntStateOf(3) }
    var emotionBefore by remember { mutableStateOf("") }
    var emotionAfter by remember { mutableStateOf("") }
    var mistakes by remember { mutableStateOf(setOf<String>()) }
    var notes by remember { mutableStateOf("") }
    var screenshotUri by remember { mutableStateOf<Uri?>(null) }
    var pnlOverride by remember { mutableStateOf(false) }
    var manualPnl by remember { mutableStateOf("") }

    val uiState by viewModel.uiState.collectAsState()

    // Image picker
    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri -> screenshotUri = uri }

    // Calculated values
    val calculatedPips = if (entryPrice.isNotBlank() && exitPrice.isNotBlank()) {
        TradeUtils.calculatePips(pair, side, entryPrice.toDoubleOrNull() ?: 0.0, exitPrice.toDoubleOrNull() ?: 0.0)
    } else 0.0

    val calculatedPnl = if (entryPrice.isNotBlank() && exitPrice.isNotBlank() && lotSize.isNotBlank()) {
        TradeUtils.calculatePnl(
            pair,
            side,
            entryPrice.toDoubleOrNull() ?: 0.0,
            exitPrice.toDoubleOrNull() ?: 0.0,
            lotSize.toDoubleOrNull() ?: 0.0
        )
    } else 0.0

    val calculatedRR = TradeUtils.calculateRR(
        entryPrice.toDoubleOrNull() ?: 0.0,
        stopLoss.toDoubleOrNull(),
        takeProfit.toDoubleOrNull(),
        side
    )

    val effectivePnl = if (pnlOverride) {
        manualPnl.toDoubleOrNull()
    } else if (exitPrice.isNotBlank()) {
        calculatedPnl
    } else null

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
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "New Trade",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "Log every detail for better analysis",
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedText
                )
            }
        }

        // Live summary
        if (pair.isNotBlank() && entryPrice.isNotBlank()) {
            GlassCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        ResultBadge(
                            result = if (exitPrice.isBlank()) "open" else if ((effectivePnl ?: 0.0) > 0) "win" else "loss",
                            isWin = (effectivePnl ?: 0.0) > 0,
                            isLoss = (effectivePnl ?: 0.0) < 0
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = pair,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = " ${side.uppercase()}",
                                style = MaterialTheme.typography.labelSmall,
                                color = MutedText
                            )
                        }
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "P/L",
                            style = MaterialTheme.typography.labelSmall,
                            color = MutedText
                        )
                        Text(
                            text = effectivePnl?.let { TradeUtils.formatCurrency(it) } ?: "---",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = when {
                                effectivePnl == null -> MutedText
                                effectivePnl > 0 -> Profit
                                effectivePnl < 0 -> Loss
                                else -> OnSurface
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Trade Details Section
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                SectionHeader(
                    title = "Trade Details",
                    icon = { Icon(Icons.Filled.Timeline, contentDescription = null, tint = Primary) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Pair selector
                Text(
                    text = "Pair",
                    style = MaterialTheme.typography.labelMedium,
                    color = MutedText
                )
                var pairExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = pairExpanded,
                    onExpandedChange = { pairExpanded = it }
                ) {
                    OutlinedTextField(
                        value = pair,
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = pairExpanded) }
                    )
                    ExposedDropdownMenu(
                        expanded = pairExpanded,
                        onDismissRequest = { pairExpanded = false }
                    ) {
                        Constants.POPULAR_PAIRS.forEach { p ->
                            DropdownMenuItem(
                                text = { Text(p) },
                                onClick = {
                                    pair = p
                                    pairExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Side selector
                Text(
                    text = "Direction",
                    style = MaterialTheme.typography.labelMedium,
                    color = MutedText
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceVariant)
                        .padding(4.dp)
                ) {
                    listOf("buy", "sell").forEach { s ->
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { side = s },
                            color = if (side == s) {
                                if (s == "buy") Profit else Loss
                            } else Color.Transparent
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    if (s == "buy") Icons.Filled.TrendingUp else Icons.Filled.TrendingDown,
                                    contentDescription = null,
                                    tint = if (side == s) Color.White else MutedText,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = s.uppercase(),
                                    style = MaterialTheme.typography.labelMedium,
                                    color = if (side == s) Color.White else MutedText,
                                    modifier = Modifier.padding(start = 4.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = lotSize,
                        onValueChange = { lotSize = it },
                        label = { Text("Lot size") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                    OutlinedTextField(
                        value = entryPrice,
                        onValueChange = { entryPrice = it },
                        label = { Text("Entry price") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = exitPrice,
                        onValueChange = { exitPrice = it },
                        label = { Text("Exit price") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        supportingText = { Text("Leave empty for open trade") }
                    )
                }

                // Auto P/L preview
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = SurfaceVariant
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Filled.Calculate,
                                    contentDescription = null,
                                    tint = MutedText,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = " Auto-calculated P/L",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MutedText
                                )
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Checkbox(
                                    checked = pnlOverride,
                                    onCheckedChange = { pnlOverride = it }
                                )
                                Text(
                                    text = "Override",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MutedText
                                )
                            }
                        }

                        if (pnlOverride) {
                            OutlinedTextField(
                                value = manualPnl,
                                onValueChange = { manualPnl = it },
                                label = { Text("Manual P/L") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                                shape = RoundedCornerShape(8.dp),
                                supportingText = { Text("Use negative for losses") }
                            )
                        } else {
                            Text(
                                text = effectivePnl?.let { TradeUtils.formatCurrency(it) } ?: "---",
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = when {
                                    effectivePnl == null -> MutedText
                                    effectivePnl > 0 -> Profit
                                    effectivePnl < 0 -> Loss
                                    else -> OnSurface
                                },
                                modifier = Modifier.padding(top = 8.dp)
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Risk Management Section
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                SectionHeader(
                    title = "Risk Management",
                    icon = { Icon(Icons.Filled.Security, contentDescription = null, tint = Primary) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = stopLoss,
                        onValueChange = { stopLoss = it },
                        label = { Text("Stop loss") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                    OutlinedTextField(
                        value = takeProfit,
                        onValueChange = { takeProfit = it },
                        label = { Text("Take profit") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = if (calculatedRR != null) "1 : ${"%.2f".format(calculatedRR)}" else "---",
                    onValueChange = {},
                    label = { Text("R:R (auto)") },
                    readOnly = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Strategy Section
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                SectionHeader(
                    title = "Strategy",
                    icon = { Icon(Icons.Filled.TipsAndUpdates, contentDescription = null, tint = Primary) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                var strategyExpanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = strategyExpanded,
                    onExpandedChange = { strategyExpanded = it }
                ) {
                    OutlinedTextField(
                        value = strategy.ifBlank { "Select strategy" },
                        onValueChange = {},
                        readOnly = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = strategyExpanded) }
                    )
                    ExposedDropdownMenu(
                        expanded = strategyExpanded,
                        onDismissRequest = { strategyExpanded = false }
                    ) {
                        Constants.STRATEGIES.forEach { s ->
                            DropdownMenuItem(
                                text = { Text(s) },
                                onClick = {
                                    strategy = s
                                    strategyExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Session",
                    style = MaterialTheme.typography.labelMedium,
                    color = MutedText
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("asia", "london", "new_york", "other").forEach { s ->
                        FilterChip(
                            selected = session == s,
                            onClick = { session = s },
                            label = {
                                Text(
                                    s.replace("_", " ")
                                        .replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() })
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Confidence (1-5)",
                    style = MaterialTheme.typography.labelMedium,
                    color = MutedText
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    (1..5).forEach { n ->
                        OutlinedButton(
                            onClick = { confidence = n },
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (confidence == n) Primary else Color.Transparent,
                                contentColor = if (confidence == n) Color.White else OnSurface
                            )
                        ) {
                            Text(n.toString())
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Psychology Section
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                SectionHeader(
                    title = "Psychology",
                    icon = { Icon(Icons.Filled.Psychology, contentDescription = null, tint = Primary) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    var emotionBeforeExpanded by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = emotionBeforeExpanded,
                        onExpandedChange = { emotionBeforeExpanded = it },
                        modifier = Modifier.weight(1f)
                    ) {
                        OutlinedTextField(
                            value = emotionBefore.ifBlank { "Before" },
                            onValueChange = {},
                            readOnly = true,
                            modifier = Modifier.menuAnchor(),
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = emotionBeforeExpanded) }
                        )
                        ExposedDropdownMenu(
                            expanded = emotionBeforeExpanded,
                            onDismissRequest = { emotionBeforeExpanded = false }
                        ) {
                            Constants.EMOTIONS.forEach { e ->
                                DropdownMenuItem(
                                    text = { Text(e) },
                                    onClick = {
                                        emotionBefore = e
                                        emotionBeforeExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    var emotionAfterExpanded by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = emotionAfterExpanded,
                        onExpandedChange = { emotionAfterExpanded = it },
                        modifier = Modifier.weight(1f)
                    ) {
                        OutlinedTextField(
                            value = emotionAfter.ifBlank { "After" },
                            onValueChange = {},
                            readOnly = true,
                            modifier = Modifier.menuAnchor(),
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = emotionAfterExpanded) }
                        )
                        ExposedDropdownMenu(
                            expanded = emotionAfterExpanded,
                            onDismissRequest = { emotionAfterExpanded = false }
                        ) {
                            Constants.EMOTIONS.forEach { e ->
                                DropdownMenuItem(
                                    text = { Text(e) },
                                    onClick = {
                                        emotionAfter = e
                                        emotionAfterExpanded = false
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Mistakes made",
                    style = MaterialTheme.typography.labelMedium,
                    color = MutedText
                )
                Spacer(modifier = Modifier.height(8.dp))
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Constants.COMMON_MISTAKES.forEach { m ->
                        FilterChip(
                            selected = m in mistakes,
                            onClick = {
                                mistakes = if (m in mistakes) mistakes - m else mistakes + m
                            },
                            label = { Text(m, fontSize = 12.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LossBackground,
                                selectedLabelColor = Loss
                            )
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Notes Section
        GlassCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                SectionHeader(
                    title = "Notes & Screenshot",
                    icon = { Icon(Icons.Filled.EditNote, contentDescription = null, tint = Primary) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notes") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 100.dp),
                    shape = RoundedCornerShape(12.dp),
                    placeholder = { Text("Setup reasoning, lessons learned...") }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Screenshot picker
                screenshotUri?.let { uri ->
                    Image(
                        painter = rememberAsyncImagePainter(uri),
                        contentDescription = "Trade screenshot",
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 200.dp)
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = { screenshotUri = null },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Filled.Close, contentDescription = null)
                        Text("Remove image")
                    }
                } ?: run {
                    OutlinedButton(
                        onClick = { imagePicker.launch("image/*") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(80.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Filled.AddPhotoAlternate, contentDescription = null)
                        Text(" Upload chart screenshot")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Action buttons
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
                onClick = {
                    // Reset form
                    pair = "EURUSD"
                    side = "buy"
                    lotSize = ""
                    entryPrice = ""
                    exitPrice = ""
                    stopLoss = ""
                    takeProfit = ""
                    strategy = ""
                    mistakes = emptySet()
                    notes = ""
                    screenshotUri = null
                },
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Filled.Refresh, contentDescription = null)
                Text(" Clear")
            }

            PrimaryButton(
                text = "Save Trade",
                isLoading = uiState.isSaving,
                onClick = {
                    viewModel.saveTrade(
                        userId = "current-user-id",
                        pair = pair,
                        side = side,
                        lotSize = lotSize.toDoubleOrNull() ?: 0.0,
                        entryPrice = entryPrice.toDoubleOrNull() ?: 0.0,
                        exitPrice = exitPrice.toDoubleOrNull(),
                        stopLoss = stopLoss.toDoubleOrNull(),
                        takeProfit = takeProfit.toDoubleOrNull(),
                        strategy = strategy.ifBlank { null },
                        session = session,
                        confidence = confidence,
                        emotionBefore = emotionBefore.ifBlank { null },
                        emotionAfter = emotionAfter.ifBlank { null },
                        mistakes = mistakes.toList(),
                        notes = notes.ifBlank { null },
                        pnl = effectivePnl,
                        rrRatio = calculatedRR
                    ) { tradeId ->
                        onTradeSaved(tradeId)
                    }
                },
                modifier = Modifier.weight(2f)
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
