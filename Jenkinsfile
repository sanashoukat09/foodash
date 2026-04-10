pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/sanashoukat09/foodash.git'
            }
        }

        stage('Build') {
            steps {
                sh 'docker-compose -f docker-compose.jenkins.yml -p foodash_jenkins down || true'
                sh 'docker-compose -f docker-compose.jenkins.yml -p foodash_jenkins up -d'
            }
        }
    }

    post {
        success {
            echo 'Build successful! FooDash Jenkins deployment is up.'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
