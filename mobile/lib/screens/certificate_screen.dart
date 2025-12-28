import 'package:flutter/material.dart';

class CertificateScreen extends StatelessWidget {
  final Map<String, dynamic> certificateData;

  const CertificateScreen({Key? key, required this.certificateData})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Certificate of Completion')),
      body: Container(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.indigo, width: 2),
              borderRadius: BorderRadius.circular(10),
              color: Colors.indigo.shade50,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'CERTIFICATE OF COMPLETION',
                  style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.indigo),
                ),
                const SizedBox(height: 20),
                const Text('This certifies that',
                    style: TextStyle(fontSize: 16)),
                const SizedBox(height: 10),
                Text(
                  certificateData['user_name'] ?? 'User',
                  style: const TextStyle(
                      fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                const Text('has successfully completed the training course',
                    style: TextStyle(fontSize: 16)),
                const SizedBox(height: 10),
                Text(
                  certificateData['course_title'] ?? 'Course',
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      fontStyle: FontStyle.italic),
                ),
                const SizedBox(height: 20),
                Text(
                    'Issued on: ${DateTime.parse(certificateData['issued_at']).toLocal().toString().split(' ')[0]}',
                    style: const TextStyle(fontSize: 14, color: Colors.grey)),
                const SizedBox(height: 5),
                Text('Certificate ID: ${certificateData['certificate_code']}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
