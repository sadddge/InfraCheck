import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';

final GoRouter router = GoRouter(

    initialLocation: '/login',
    routes: [
      GoRoute(// aqui añado la base de las pantallas
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context,state) => const HomeScreen(),
      ),

    ],
);