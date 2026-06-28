// This is a placeholder for the site module (React/TypeScript)
// The actual build is handled by npm/vite in the site/ directory
// This file exists for IntelliJ to recognize the module structure

plugins {
    base
}

tasks.register("npmInstall") {
    group = "npm"
    description = "Install npm dependencies"
    doLast {
        exec {
            workingDir = projectDir
            commandLine("npm", "install")
        }
    }
}

tasks.register("npmBuild") {
    group = "npm"
    description = "Build the site for production"
    dependsOn("npmInstall")
    doLast {
        exec {
            workingDir = projectDir
            commandLine("npm", "run", "build")
        }
    }
}

tasks.register("npmDev") {
    group = "npm"
    description = "Start development server"
    dependsOn("npmInstall")
    doLast {
        exec {
            workingDir = projectDir
            commandLine("npm", "run", "dev")
        }
    }
}
