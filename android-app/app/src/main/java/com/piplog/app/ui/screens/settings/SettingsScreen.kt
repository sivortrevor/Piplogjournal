package com.piplog.app.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.piplog.app.ui.components.PipLogLogo
import com.piplog.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onSignOut: () -> Unit
) {
    var showDeleteDialog by remember { mutableStateOf(false) }

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
                text = "Settings",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold
            )
        }

        // Account section
        Text(
            text = "ACCOUNT",
            style = MaterialTheme.typography.labelSmall,
            color = MutedText,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        SettingsItem(
            icon = Icons.Filled.Person,
            title = "Edit Profile",
            subtitle = "Update your name and avatar"
        )

        SettingsItem(
            icon = Icons.Filled.Lock,
            title = "Change Password",
            subtitle = "Update your security credentials"
        )

        SettingsItem(
            icon = Icons.Filled.CurrencyExchange,
            title = "Preferred Currency",
            subtitle = "USD",
            trailing = { Text(">", color = MutedText) }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // App section
        Text(
            text = "APP",
            style = MaterialTheme.typography.labelSmall,
            color = MutedText,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        var darkModeEnabled by remember { mutableStateOf(true) }
        SettingsToggle(
            icon = Icons.Filled.DarkMode,
            title = "Dark Mode",
            subtitle = "Use dark theme",
            checked = darkModeEnabled,
            onCheckedChange = { darkModeEnabled = it }
        )

        var notificationsEnabled by remember { mutableStateOf(true) }
        SettingsToggle(
            icon = Icons.Filled.Notifications,
            title = "Notifications",
            subtitle = "Trade reminders and weekly summaries",
            checked = notificationsEnabled,
            onCheckedChange = { notificationsEnabled = it }
        )

        SettingsItem(
            icon = Icons.Filled.Language,
            title = "Language",
            subtitle = "English",
            trailing = { Text(">", color = MutedText) }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Support section
        Text(
            text = "SUPPORT",
            style = MaterialTheme.typography.labelSmall,
            color = MutedText,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        SettingsItem(
            icon = Icons.Filled.Help,
            title = "Help Center",
            subtitle = "FAQs and guides"
        )

        SettingsItem(
            icon = Icons.Filled.Feedback,
            title = "Send Feedback",
            subtitle = "Report bugs or suggest features"
        )

        SettingsItem(
            icon = Icons.Filled.Star,
            title = "Rate Us",
            subtitle = "Share your experience on the Play Store"
        )

        SettingsItem(
            icon = Icons.Filled.PrivacyTip,
            title = "Privacy Policy",
            subtitle = "How we handle your data"
        )

        SettingsItem(
            icon = Icons.Filled.Description,
            title = "Terms of Service",
            subtitle = "Legal agreements"
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Danger zone
        Text(
            text = "DANGER ZONE",
            style = MaterialTheme.typography.labelSmall,
            color = Loss,
            modifier = Modifier.padding(vertical = 8.dp)
        )

        OutlinedButton(
            onClick = { showDeleteDialog = true },
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Loss
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Filled.DeleteForever, contentDescription = null)
            Text(" Delete All Trades")
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Sign out
        Button(
            onClick = onSignOut,
            colors = ButtonDefaults.buttonColors(
                containerColor = Primary
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null)
            Text(" Sign Out")
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Version
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            PipLogLogo(size = 32.dp)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "PipLog v1.0.0",
                style = MaterialTheme.typography.bodySmall,
                color = MutedText,
                modifier = Modifier.align(Alignment.CenterVertically)
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }

    // Delete confirmation dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete All Trades?") },
            text = { Text("This action cannot be undone. All your trade history, notes, and analytics will be permanently deleted.") },
            confirmButton = {
                Button(
                    onClick = { showDeleteDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = Loss)
                ) {
                    Text("Delete All")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun SettingsItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    trailing: (@Composable () -> Unit)? = null
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = SurfaceVariant.copy(alpha = 0.3f),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = Primary)
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp)
            ) {
                Text(title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                Text(subtitle, style = MaterialTheme.typography.labelSmall, color = MutedText)
            }
            trailing?.invoke()
        }
    }
}

@Composable
fun SettingsToggle(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = SurfaceVariant.copy(alpha = 0.3f),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = null, tint = Primary)
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp)
            ) {
                Text(title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                Text(subtitle, style = MaterialTheme.typography.labelSmall, color = MutedText)
            }
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = SwitchDefaults.colors(checkedThumbColor = Primary)
            )
        }
    }
}
