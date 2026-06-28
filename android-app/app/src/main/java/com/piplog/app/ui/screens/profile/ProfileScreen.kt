package com.piplog.app.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.piplog.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ProfileScreen(onNavigateBack: () -> Unit) {
    var displayName by remember { mutableStateOf("Trader") }
    var isEditing by remember { mutableStateOf(false) }

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
            Text(
                text = "Profile",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.weight(1f))
            if (!isEditing) {
                IconButton(onClick = { isEditing = true }) {
                    Icon(Icons.Filled.Edit, contentDescription = "Edit", tint = Primary)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Avatar and name
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(Primary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = displayName.firstOrNull()?.uppercase() ?: "T",
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = PrimaryContainer
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (isEditing) {
                OutlinedTextField(
                    value = displayName,
                    onValueChange = { displayName = it },
                    label = { Text("Display Name") },
                    textStyle = androidx.compose.ui.text.TextStyle(
                        fontWeight = FontWeight.ExtraBold,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    ),
                    modifier = Modifier.fillMaxWidth(0.8f),
                    shape = RoundedCornerShape(16.dp),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { isEditing = false },
                        colors = ButtonDefaults.buttonColors(containerColor = Primary)
                    ) {
                        Text("Save")
                    }
                    OutlinedButton(onClick = { isEditing = false }) {
                        Text("Cancel")
                    }
                }
            } else {
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.ExtraBold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "trader@email.com",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedText
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Stats
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatBox(
                value = "142",
                label = "Total Trades",
                modifier = Modifier.weight(1f)
            )
            StatBox(
                value = "67%",
                label = "Win Rate",
                modifier = Modifier.weight(1f)
            )
            StatBox(
                value = "$4,520",
                label = "Net P/L",
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Subscription
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = Primary.copy(alpha = 0.1f)
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Free Plan",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Upgrade to Pro for unlimited trades and advanced analytics",
                        style = MaterialTheme.typography.bodySmall,
                        color = MutedText
                    )
                }
                Button(
                    onClick = { },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Text("Upgrade")
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Account info
        Text(
            text = "Account Info",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MutedText
        )

        Spacer(modifier = Modifier.height(12.dp))

        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = SurfaceVariant.copy(alpha = 0.5f)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                InfoRow("Account Created", "Jan 15, 2024")
                InfoRow("Last Active", SimpleDateFormat("MMM dd, yyyy", Locale.US).format(Date()))
                InfoRow("Preferred Currency", "USD")
                InfoRow("Subscription", "Free")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Achievements
        Text(
            text = "Recent Achievements",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MutedText
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            AchievementBadge("\uD83D\uDD25", "10 Winning Days")
            AchievementBadge("\uD83C\uDFC6", "Best Week +$850")
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Danger zone
        OutlinedButton(
            onClick = { },
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Loss),
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Filled.DeleteForever, contentDescription = null)
            Text(" Delete Account")
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun StatBox(value: String, label: String, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = SurfaceVariant
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MutedText,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MutedText)
        Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun AchievementBadge(icon: String, label: String) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Profit.copy(alpha = 0.1f)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(icon, style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = Profit,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
