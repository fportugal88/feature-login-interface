import 'package:dio/dio.dart';

class DioClient {
  static Dio build() {
    final dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 20),
      ),
    );
    dio.interceptors.add(
      LogInterceptor(requestBody: true),
    );
    return dio;
  }
}
