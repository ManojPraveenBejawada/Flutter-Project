import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'certificate_screen.dart';

class QuizResultScreen extends StatelessWidget {
  final Map<String, dynamic> result;
  final int quizId;

  const QuizResultScreen({Key? key, required this.result, required this.quizId})
      : super(key: key);

  // Method to fetch certificate data and navigate to the certificate screen
  void _viewCertificate(BuildContext context) async {
    try {
      // In a real production app, the user ID would come from a secure state management solution
      const int userId = 1; // Using a placeholder for now
      final certificateData = await ApiService.getCertificate(userId, quizId);

      // Navigate to the new screen to display the certificate
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) =>
              CertificateScreen(certificateData: certificateData),
        ),
      );
    } catch (e) {
      // Show an error message if the certificate can't be loaded
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not load certificate: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Extract data from the result map
    final int score = result['score'] ?? 0;
    final int totalQuestions = result['totalQuestions'] ?? 0;
    final bool passed = result['passed'] ?? false;
    final double percentage =
        totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz Result'),
        automaticallyImplyLeading: false, // This removes the default back arrow
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Display a dynamic message based on whether the user passed
              Text(
                passed ? 'Congratulations, you passed!' : 'Try Again!',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color:
                          passed ? Colors.green.shade700 : Colors.red.shade700,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              // Display the final score
              Text(
                'Your Score: $score / $totalQuestions (${percentage.toStringAsFixed(1)}%)',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 40),

              // Conditionally show the "View Certificate" button only if the user passed
              if (passed)
                ElevatedButton.icon(
                  icon: const Icon(Icons.celebration),
                  label: const Text('View Certificate'),
                  onPressed: () => _viewCertificate(context),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber.shade700),
                ),
              const SizedBox(height: 10),

              // Button to return to the dashboard
              ElevatedButton(
                onPressed: () {
                  // This will pop all screens off the stack until it finds the one named '/dashboard'
                  Navigator.popUntil(
                      context, (route) => route.settings.name == '/dashboard');
                },
                child: const Text('Back to Dashboard'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
