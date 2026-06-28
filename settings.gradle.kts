rootProject.name = "shamik-sh"

enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode = RepositoriesMode.FAIL_ON_PROJECT_REPOS

    repositories {
        mavenCentral()
    }
}

// AWS Lambda modules
"aws-lambda".apply {
    includeSubModule("api")
}

// Site module (React/TypeScript frontend)
include("site")

fun String.includeSubModule(name: String) {
    val projectName = ":$this:$this-$name"
    include(projectName)
    project(projectName).projectDir = File("$this/$name")
}
