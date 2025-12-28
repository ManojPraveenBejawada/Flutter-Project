import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'quiz_result_screen.dart'; // Import the result screen

class QuizScreen extends StatefulWidget {
  final Map<String, dynamic> quiz;

  const QuizScreen({Key? key, required this.quiz}) : super(key: key);

  @override
  _QuizScreenState createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  late Future<List<dynamic>> _questionsFuture;
  final Map<int, int> _selectedAnswers =
      {}; // Map<questionId, selectedOptionId>

  @override
  void initState() {
    super.initState();
    _questionsFuture = ApiService.getQuestionsForQuiz(widget.quiz['id']);
  }

  void _submitQuiz() async {
    try {
      // In a real app, user ID would come from a global state/provider
      const int userId = 1;
      final Map<String, int> answersForApi =
          _selectedAnswers.map((key, value) => MapEntry(key.toString(), value));

      final result =
          await ApiService.submitQuiz(widget.quiz['id'], userId, answersForApi);

      // This is the corrected navigation call. We now pass the quizId.
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => QuizResultScreen(
            result: result,
            quizId: widget.quiz['id'], // Pass the quizId here
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit quiz: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.quiz['title'] ?? 'Quiz'),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _questionsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
                child: Text('No questions found for this quiz.'));
          }

          final questions = snapshot.data!;
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(8.0),
                  itemCount: questions.length,
                  itemBuilder: (context, index) {
                    final question = questions[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Q${index + 1}: ${question['question_text']}',
                              style: const TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 10),
                            ...List<Widget>.from(question['options'].map((opt) {
                              return RadioListTile<int>(
                                title: Text(opt['option_text']),
                                value: opt['id'],
                                groupValue: _selectedAnswers[question['id']],
                                onChanged: (value) {
                                  setState(() {
                                    _selectedAnswers[question['id']] = value!;
                                  });
                                },
                              );
                            })),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  onPressed: _selectedAnswers.length == questions.length
                      ? _submitQuiz
                      : null,
                  style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50)),
                  child: const Text('Submit Quiz'),
                ),
              )
            ],
          );
        },
      ),
    );
  }
}
