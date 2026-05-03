pipeline {
    agent any
    stages {
        stage('Deploy FooDash') {
            steps {
                sh 'sudo systemctl start nginx'
                sh 'pm2 start /home/ubuntu/foodash/backend/server.js --name foodash-api || pm2 restart foodash-api'
            }
        }
    }
    post {
        always {
            emailext(
                to: "sanashoukat099@gmail.com",
                subject: "FooDash Deployment - Build #${BUILD_NUMBER} - ${currentBuild.currentResult}",
                body: "<h2>FooDash Deployment</h2><p>Status: ${currentBuild.currentResult}</p><p>Build: #${BUILD_NUMBER}</p><p>URL: http://52.64.176.76</p>",
                mimeType: 'text/html'
            )
        }
    }
}

