import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  String _errorMessage = '';

  Future<void> _register() async {
    setState(() {
      _errorMessage = '';
    });

    // Create a map to hold the registration data
    final Map<String, String> data = {
      'name': _nameController.text,
      'email': _emailController.text,
      'phone': _phoneController.text,
      'password': _passwordController.text,
    };

    try {
      // Pass the single map object to the ApiService
      final response = await ApiService.registerUser(data);

      if (response['message'] == 'Registration successful') {
        // Show a success message and then pop back to the login screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Registration successful! Please login.')),
        );
        Navigator.pop(context); // Go back to the login screen
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Registration failed.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Could not connect to the server.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
              ),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                keyboardType: TextInputType.emailAddress,
              ),
              TextField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone'),
                keyboardType: TextInputType.phone,
              ),
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _register,
                child: const Text('Register'),
              ),
              if (_errorMessage.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(
                    _errorMessage,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
