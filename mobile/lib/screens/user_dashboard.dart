import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'course_details_screen.dart';

class UserDashboard extends StatefulWidget {
  const UserDashboard({Key? key}) : super(key: key);

  @override
  _UserDashboardState createState() => _UserDashboardState();
}

class _UserDashboardState extends State<UserDashboard> {
  late Future<List<dynamic>> _assignedCoursesFuture;

  @override
  void initState() {
    super.initState();
    // In a real, production application, you would get the logged-in user's ID
    // from a state management solution (like Provider, Riverpod, or Bloc) after login.
    // For now, we are hardcoding it to '1' for demonstration purposes.
    const int userId = 1;
    _assignedCoursesFuture = ApiService.getAssignedCourses(userId);
  }

  // --- New Logout Function ---
  void _logout() {
    // Navigate back to the login screen and remove all other screens from the stack
    // This ensures the user can't press the "back" button to get back into the dashboard
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Assigned Courses'),
        backgroundColor: Colors.indigo,
        // --- This is the new Logout Button ---
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: _logout, // Calls the logout function
          ),
        ],
        // --- End of new code ---
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _assignedCoursesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
                child: Text('No courses have been assigned to you yet.'));
          }

          final courses = snapshot.data!;
          return ListView.builder(
            itemCount: courses.length,
            itemBuilder: (context, index) {
              final course = courses[index];
              return Card(
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16.0),
                  title: Text(
                    course['title'] ?? 'No Title',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(course['description'] ?? 'No description'),
                  trailing: const Icon(Icons.arrow_forward_ios),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            CourseDetailsScreen(course: course),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
