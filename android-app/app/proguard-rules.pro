# Add project specific ProGuard rules here.
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.piplog.app.data.model.** { *; }
-keep class io.github.jan-tennert.supabase.** { *; }
-keep class io.ktor.** { *; }
