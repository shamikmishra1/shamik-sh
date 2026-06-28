import org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
import org.gradle.api.tasks.testing.logging.TestLogEvent.FAILED
import org.gradle.api.tasks.testing.logging.TestLogEvent.PASSED
import org.gradle.api.tasks.testing.logging.TestLogEvent.SKIPPED

plugins {
    alias(libs.plugins.kotlin).apply(false)
    alias(libs.plugins.kotlin.serialization).apply(false)
    alias(libs.plugins.shadow).apply(false)
}

allprojects {
    group = "com.shamikmishra"
    version = "1.0.0"
}

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        extensions.configure<org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension> {
            jvmToolchain(21)
        }

        tasks.withType<Test> {
            useJUnitPlatform()
            testLogging {
                exceptionFormat = FULL
                events = setOf(FAILED, PASSED, SKIPPED)
                showExceptions = true
                showCauses = true
                showStackTraces = true
            }
        }
    }
}
