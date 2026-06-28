plugins {
    alias(libs.plugins.kotlin)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.shadow)
}

dependencies {
    implementation(libs.aws.lambda.java.core)
    implementation(libs.aws.lambda.java.events)
    implementation(libs.aws.sdk.secretsmanager)
    implementation(libs.aws.sdk.url.connection.client)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlin.logging)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.java)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.ktor.serialization.json)
    runtimeOnly(libs.logback.classic)

    testImplementation(kotlin("test"))
    testImplementation(libs.junit.jupiter)
}

tasks.shadowJar {
    archiveBaseName.set("api")
    archiveClassifier.set("all")
    archiveVersion.set("")
    mergeServiceFiles()
}

tasks.build {
    dependsOn(tasks.shadowJar)
}
