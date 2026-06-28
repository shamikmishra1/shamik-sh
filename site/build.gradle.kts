// Site module (React/TypeScript frontend)
// Actual build is handled by npm/vite - these tasks are convenience wrappers

plugins {
    base
}

tasks.register<Exec>("npmInstall") {
    group = "npm"
    description = "Install npm dependencies"
    workingDir = projectDir
    commandLine("npm", "install")
}

tasks.register<Exec>("npmBuild") {
    group = "npm"
    description = "Build the site for production"
    dependsOn("npmInstall")
    workingDir = projectDir
    commandLine("npm", "run", "build")
}

tasks.register<Exec>("npmDev") {
    group = "npm"
    description = "Start development server"
    dependsOn("npmInstall")
    workingDir = projectDir
    commandLine("npm", "run", "dev")
}
