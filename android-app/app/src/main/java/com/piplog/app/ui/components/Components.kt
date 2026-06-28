package com.piplog.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.piplog.app.ui.theme.*

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true
) {
    val gradient = Brush.linearGradient(
        colors = listOf(GradientStart, GradientEnd),
        start = Offset.Zero,
        end = Offset.Infinite
    )

    Button(
        onClick = onClick,
        enabled = enabled && !isLoading,
        modifier = modifier
            .height(56.dp)
            .drawBehind {
                drawRoundRect(
                    brush = gradient,
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(16.dp.toPx()),
                    style = Stroke(width = 0.dp.toPx())
                )
            },
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            contentColor = Color.White,
            disabledContainerColor = Color.Transparent
        )
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = Color.White,
                strokeWidth = 2.dp
            )
        } else {
            Text(
                text = text,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
}

@Composable
fun PipLogLogo(
    size: Dp = 48.dp,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(12.dp))
            .background(Primary),
        contentAlignment = Alignment.Center
    ) {
        val fontSize = (size.value * 0.4f).sp
        val textStyle = MaterialTheme.typography.headlineLarge.copy(
            fontSize = fontSize,
            fontWeight = androidx.compose.ui.text.font.FontWeight.ExtraBold
        )
        Text(
            text = "P",
            style = textStyle,
            color = Color.White
        )
    }
}

@Composable
fun StatPill(
    label: String,
    value: String,
    tone: StatTone = StatTone.NEUTRAL,
    modifier: Modifier = Modifier
) {
    val valueColor = when (tone) {
        StatTone.POSITIVE -> Profit
        StatTone.NEGATIVE -> Loss
        StatTone.NEUTRAL -> OnSurface
    }

    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(SurfaceVariant)
            .padding(16.dp)
    ) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = MutedText
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            color = valueColor,
            fontWeight = androidx.compose.ui.text.font.FontWeight.ExtraBold,
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}

enum class StatTone {
    POSITIVE, NEGATIVE, NEUTRAL
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(Surface.copy(alpha = 0.8f))
            .then(
                Modifier.drawBehind {
                    drawRoundRect(
                        color = BorderColor.copy(alpha = 0.5f),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(24.dp.toPx()),
                        style = Stroke(width = 1.dp.toPx())
                    )
                }
            )
    ) {
        content()
    }
}

@Composable
fun ResultBadge(
    result: String?,
    isWin: Boolean,
    isLoss: Boolean
) {
    val (bgColor, textColor) = when {
        isWin -> ProfitBackground to Profit
        isLoss -> LossBackground to Loss
        else -> SurfaceVariant to MutedText
    }

    Surface(
        shape = RoundedCornerShape(50),
        color = bgColor
    ) {
        Text(
            text = result?.uppercase() ?: "OPEN",
            style = MaterialTheme.typography.labelSmall,
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun SectionHeader(
    title: String,
    icon: @Composable () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        icon()
        Text(
            text = title,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
        )
    }
}
