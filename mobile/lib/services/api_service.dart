import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    } else {
      return 'http://10.0.2.2:5000';
    }
  }

  // User Auth
  static Future<Map<String, dynamic>> registerUser(
      Map<String, String> data) async {
    final response = await http.post(Uri.parse('$baseUrl/api/users/register'),
        headers: {'Content-Type': 'application/json'}, body: json.encode(data));
    return json.decode(response.body);
  }

  static Future<Map<String, dynamic>> loginUser(
      Map<String, String> data) async {
    final response = await http.post(Uri.parse('$baseUrl/api/users/login'),
        headers: {'Content-Type': 'application/json'}, body: json.encode(data));
    return json.decode(response.body);
  }

  // Data Fetching
  static Future<List<dynamic>> getCourses() async {
    final response = await http.get(Uri.parse('$baseUrl/api/courses'));
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load courses');
  }

  static Future<List<dynamic>> getMaterialsForCourse(int courseId) async {
    final response =
        await http.get(Uri.parse('$baseUrl/api/materials/course/$courseId'));
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load materials');
  }

  // Quizzes
  static Future<Map<String, dynamic>> getQuizByMaterialId(
      int materialId, int userId) async {
    final response = await http.get(
        Uri.parse('$baseUrl/api/quizzes/material/$materialId?user_id=$userId'));
    if (response.statusCode == 200) return json.decode(response.body);
    if (response.statusCode == 404) return {};
    throw Exception('Failed to get quiz');
  }

  static Future<List<dynamic>> getQuestionsForQuiz(int quizId) async {
    final response =
        await http.get(Uri.parse('$baseUrl/api/quizzes/$quizId/questions'));
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load questions');
  }

  static Future<Map<String, dynamic>> submitQuiz(
      int quizId, int userId, Map<String, int> answers) async {
    final response = await http.post(Uri.parse('$baseUrl/api/quizzes/submit'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(
            {'quiz_id': quizId, 'user_id': userId, 'answers': answers}));
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to submit quiz');
  }

  // Assignments
  static Future<List<dynamic>> getAssignedCourses(int userId) async {
    final response =
        await http.get(Uri.parse('$baseUrl/api/assignments/user/$userId'));
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load assigned courses');
  }

  // --- This is the new, missing function ---
  static Future<Map<String, dynamic>> getCertificate(
      int userId, int quizId) async {
    final response = await http
        .get(Uri.parse('$baseUrl/api/certificates/user/$userId/quiz/$quizId'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load certificate');
    }
  }
}
