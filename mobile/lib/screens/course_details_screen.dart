import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'quiz_screen.dart';

class CourseDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> course;

  const CourseDetailsScreen({Key? key, required this.course}) : super(key: key);

  @override
  _CourseDetailsScreenState createState() => _CourseDetailsScreenState();
}

class _CourseDetailsScreenState extends State<CourseDetailsScreen> {
  late Future<List<dynamic>> _materialsFuture;

  @override
  void initState() {
    super.initState();
    _materialsFuture = ApiService.getMaterialsForCourse(widget.course['id']);
  }

  void _launchURL(String filePath) async {
    final Uri url = Uri.parse('${ApiService.baseUrl}/uploads/$filePath');
    if (!await launchUrl(url)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not launch $url')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.course['title'] ?? 'Course Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.course['title'] ?? 'No Title',
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              widget.course['description'] ?? 'No description available.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            Text('Training Materials',
                style: Theme.of(context).textTheme.headlineSmall),
            const Divider(),
            FutureBuilder<List<dynamic>>(
              future: _materialsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }
                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                      child: Text('No materials found for this course.'));
                }
                final materials = snapshot.data!;
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: materials.length,
                  itemBuilder: (context, index) {
                    final material = materials[index];
                    return MaterialCard(
                        material: material, launchURL: _launchURL);
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// This widget manages the state for a single material card, including its quiz status.
class MaterialCard extends StatefulWidget {
  final Map<String, dynamic> material;
  final Function(String) launchURL;

  const MaterialCard(
      {Key? key, required this.material, required this.launchURL})
      : super(key: key);

  @override
  _MaterialCardState createState() => _MaterialCardState();
}

class _MaterialCardState extends State<MaterialCard> {
  Future<Map<String, dynamic>>? _quizFuture;

  @override
  void initState() {
    super.initState();
    // In a real app, user ID would come from a secure state management solution.
    const int userId = 1;
    _quizFuture = ApiService.getQuizByMaterialId(widget.material['id'], userId);
  }

  @override
  Widget build(BuildContext context) {
    final String originalName =
        widget.material['original_name'] ?? 'Unknown File';
    final bool isPdf = originalName.toLowerCase().endsWith('.pdf');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            ListTile(
              leading: Icon(isPdf ? Icons.picture_as_pdf : Icons.video_library,
                  color: Colors.indigo, size: 40),
              title: Text(originalName,
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              onTap: () => widget.launchURL(widget.material['file_path']),
            ),
            FutureBuilder<Map<String, dynamic>>(
              future: _quizFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.done &&
                    snapshot.hasData &&
                    snapshot.data!.isNotEmpty) {
                  final quiz = snapshot.data!;
                  final bool hasPassed = quiz['hasPassed'] ?? false;
                  final int attemptsRemaining = quiz['attemptsRemaining'] ?? 0;

                  Widget button;

                  if (hasPassed) {
                    button = ElevatedButton.icon(
                      icon: const Icon(Icons.check_circle),
                      label: const Text('Passed'),
                      onPressed: null, // Disabled because the user has passed
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green.shade100,
                          foregroundColor: Colors.green.shade800),
                    );
                  } else if (attemptsRemaining <= 0) {
                    button = ElevatedButton.icon(
                      icon: const Icon(Icons.block),
                      label: const Text('No Attempts Left'),
                      onPressed:
                          null, // Disabled because there are no attempts left
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.shade100,
                          foregroundColor: Colors.red.shade800),
                    );
                  } else {
                    button = ElevatedButton.icon(
                      icon: const Icon(Icons.quiz),
                      label:
                          Text('Start Quiz ($attemptsRemaining attempts left)'),
                      onPressed: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => QuizScreen(quiz: quiz),
                            )).then((_) {
                          // This code runs when we return from the quiz screen.
                          // It refreshes the quiz status to update the button.
                          setState(() {
                            const int userId = 1;
                            _quizFuture = ApiService.getQuizByMaterialId(
                                widget.material['id'], userId);
                          });
                        });
                      },
                    );
                  }

                  return Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16.0, vertical: 8.0),
                    child: SizedBox(width: double.infinity, child: button),
                  );
                }
                // If there's no quiz, show nothing.
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
  }
}
