pipeline {
    agent any

    triggers {
        githubPush()
    }

    stages {

        stage('Clone App Repo') {
            steps {
                git url: 'https://github.com/sanashoukat09/foodash.git', branch: 'main'
            }
        }

        stage('Start App') {
            steps {
                sh 'sudo systemctl start nginx || true'
                sh 'sudo -u ubuntu pm2 start all || true'
            }
        }

        stage('Clone Test Repo') {
            steps {
                sh 'rm -rf foodash-tests'
                sh 'git clone https://github.com/sanashoukat09/foodash-tests.git'
            }
        }

        stage('Build Test Docker Image') {
            steps {
                dir('foodash-tests') {
                    sh 'docker build -t foodash-selenium-tests .'
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    mkdir -p foodash-tests/reports
                    docker run --rm \
                        --network host \
                        -v $(pwd)/foodash-tests/reports:/app/reports \
                        foodash-selenium-tests
                '''
            }
        }

    }

    post {
        always {
            script {
                def pusherEmail = sh(
                    script: "git log -1 --format='%ae'",
                    returnStdout: true
                ).trim()

                echo "Sending results to: ${pusherEmail}"

                emailext(
                    to: "${pusherEmail}",
                    subject: "FooDash Test Results - Build #${BUILD_NUMBER} - ${currentBuild.currentResult}",
                    body: """
                        <h2>FooDash Selenium Test Results</h2>
                        <p><b>Build Number:</b> #${BUILD_NUMBER}</p>
                        <p><b>Status:</b> ${currentBuild.currentResult}</p>
                        <p><b>Triggered by:</b> ${pusherEmail}</p>
                        <p>Please find the full test report attached.</p>
                    """,
                    mimeType: 'text/html',
                    attachmentsPattern: 'foodash-tests/reports/*.html'
                )
            }
        }
    }
}
