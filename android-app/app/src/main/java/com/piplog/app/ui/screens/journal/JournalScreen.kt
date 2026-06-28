package com.piplog.app.ui.screens.journal

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
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.piplog.app.data.model.JournalEntry
import com.piplog.app.ui.theme.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.text.SimpleDateFormat
import java.util.*

data class JournalUiState(
    val isLoading: Boolean = true,
    val entries: List<JournalEntry> = emptyList(),
    val error: String? = null
)

@Composable
fun JournalScreen(
    onNavigateBack: () -> Unit,
    viewModel: JournalViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var editingEntry by remember { mutableStateOf<JournalEntry?>(null) }

    LaunchedEffect(Unit) {
        viewModel.loadEntries("current-user-id")
    }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Journal",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Text(
                        text = "Daily reflections, lessons, and goals",
                        style = MaterialTheme.typography.bodySmall,
                        color = MutedText
                    )
                }
                IconButton(onClick = { showAddDialog = true }) {
                    Icon(Icons.Filled.Add, contentDescription = "Add entry", tint = Primary)
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxWidth().weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Primary)
                }
            } else if (uiState.entries.isEmpty()) {
                Box(modifier = Modifier.weight(1f)) {
                    EmptyJournalState(onAddEntry = { showAddDialog = true })
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(bottom = 16.dp)
                ) {
                    items(uiState.entries) { entry ->
                        JournalEntryCard(
                            entry = entry,
                            onClick = { editingEntry = entry }
                        )
                    }
                }
            }
        }
    }

    // Add/Edit dialog
    if (showAddDialog || editingEntry != null) {
        JournalEntryDialog(
            entry = editingEntry,
            onDismiss = {
                showAddDialog = false
                editingEntry = null
            },
            onSave = { title, content, type ->
                viewModel.saveEntry(title, content, type)
                showAddDialog = false
                editingEntry = null
            }
        )
    }
}

@Composable
fun EmptyJournalState(onAddEntry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Surface(
            shape = RoundedCornerShape(32.dp),
            color = Primary.copy(alpha = 0.2f)
        ) {
            Box(
                modifier = Modifier.size(64.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Filled.MenuBook,
                    contentDescription = null,
                    tint = Primary,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Journal Coming Soon",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.ExtraBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Daily entries, weekly reviews, lesson logs,\nand goal tracking — all searchable.",
            style = MaterialTheme.typography.bodyMedium,
            color = MutedText,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = onAddEntry,
            colors = ButtonDefaults.buttonColors(containerColor = Primary),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Filled.Add, contentDescription = null)
            Text(" Add Entry")
        }
    }
}

@Composable
fun JournalEntryCard(
    entry: JournalEntry,
    onClick: () -> Unit
) {
    OutlinedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.outlinedCardColors(
            containerColor = SurfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Primary.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = " ${entry.entryType.uppercase()} ",
                        style = MaterialTheme.typography.labelSmall,
                        color = Primary,
                        fontWeight = FontWeight.Bold
                    )
                }
                Text(
                    text = try {
                        SimpleDateFormat("MMM dd, yyyy", Locale.US).format(
                            SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(entry.entryDate)!!
                        )
                    } catch (e: Exception) { entry.entryDate },
                    style = MaterialTheme.typography.labelSmall,
                    color = MutedText
                )
            }

            Text(
                text = entry.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 12.dp)
            )

            if (entry.content.isNotBlank()) {
                Text(
                    text = entry.content,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MutedText,
                    maxLines = 3,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }
    }
}

@Composable
fun JournalEntryDialog(
    entry: JournalEntry?,
    onDismiss: () -> Unit,
    onSave: (title: String, content: String, type: String) -> Unit
) {
    var title by remember { mutableStateOf(entry?.title ?: "") }
    var content by remember { mutableStateOf(entry?.content ?: "") }
    var type by remember { mutableStateOf(entry?.entryType ?: "daily") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (entry == null) "New Entry" else "Edit Entry") },
        text = {
            Column {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Content") },
                    modifier = Modifier.fillMaxWidth().heightIn(min = 120.dp),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text("Entry Type", style = MaterialTheme.typography.labelMedium, color = MutedText)
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("daily", "weekly", "lesson", "goal").forEach { t ->
                        FilterChip(
                            selected = type == t,
                            onClick = { type = t },
                            label = { Text(t.replaceFirstChar { it.uppercase() }) }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { if (title.isNotBlank()) onSave(title, content, type) },
                enabled = title.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = Primary)
            ) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

class JournalViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(JournalUiState())
    val uiState: StateFlow<JournalUiState> = _uiState.asStateFlow()

    fun loadEntries(userId: String) {
        _uiState.update { it.copy(isLoading = false) }
    }

    fun saveEntry(title: String, content: String, type: String) {
        // Save entry logic
    }
}

