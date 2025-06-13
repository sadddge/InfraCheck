import 'package:flutter/material.dart';

/// Barra de navegación inferior personalizada para InfraCheck
/// 
/// Implementa una navegación de 3 pestañas con un botón central elevado
/// especial para la función de "Reportar"
class InfraNavigationBar extends StatelessWidget {
  /// Índice de la pestaña actualmente seleccionada
  final int currentIndex;
  
  /// Callback que se ejecuta cuando se toca una pestaña
  /// Recibe el índice de la pestaña tocada
  final Function(int) onTap;

  const InfraNavigationBar({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 393, minHeight: 96),
      child: Container(
        width: double.infinity,
        height: 96,
        padding: const EdgeInsets.only(bottom: 8),
        decoration: const BoxDecoration(
          color: Color(0xFFFCFDFA),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Botón Mapa
            Expanded(
              child: _NavigationItem(
                index: 0,
                currentIndex: currentIndex,
                onTap: onTap,
                icon: Icons.map_outlined,
                selectedIcon: Icons.map,
                label: 'Mapa',
                isCenter: false,
              ),
            ),
            // Botón Reportar (central con diseño especial)
            Expanded(
              child: _NavigationItem(
                index: 1,
                currentIndex: currentIndex,
                onTap: onTap,
                icon: Icons.priority_high,
                selectedIcon: Icons.priority_high,
                label: 'Reportar',
                isCenter: true,
              ),
            ),
            // Botón Cuenta
            Expanded(
              child: _NavigationItem(
                index: 2,
                currentIndex: currentIndex,
                onTap: onTap,
                icon: Icons.person_outline,
                selectedIcon: Icons.person,
                label: 'Cuenta',
                isCenter: false,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Widget interno para cada elemento de navegación
/// 
/// Maneja la presentación visual de cada botón de la barra de navegación,
/// con lógica especial para el botón central elevado
class _NavigationItem extends StatelessWidget {
  /// Índice del elemento en la barra de navegación
  final int index;
  
  /// Índice del elemento actualmente seleccionado
  final int currentIndex;
  
  /// Callback ejecutado cuando se toca el elemento
  final Function(int) onTap;
  
  /// Icono mostrado cuando el elemento no está seleccionado
  final IconData icon;
  
  /// Icono mostrado cuando el elemento está seleccionado
  final IconData selectedIcon;
  
  /// Etiqueta de texto del elemento
  final String label;
  
  /// Indica si es el botón central especial con diseño elevado
  final bool isCenter;

  const _NavigationItem({
    required this.index,
    required this.currentIndex,
    required this.onTap,
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.isCenter,
  });

  @override
  Widget build(BuildContext context) {
    final bool isSelected = currentIndex == index;    
    if (isCenter) {
      // Botón central especial con diseño elevado
      return Container(
        width: double.infinity,
        clipBehavior: Clip.none, // Permite que el botón se extienda fuera del contenedor
        child: SizedBox(
          height: 80,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // Etiqueta del botón en la parte inferior
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF104641),
                    fontSize: 12,
                    fontFamily: 'Open Sans',
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),              
              
              // Botón principal elevado
              Positioned(
                bottom: 20, // Elevado 20px desde la base
                left: 0,
                right: 0,                child: Center(
                  child: GestureDetector(
                    onTap: () => onTap(index),
                    child: Container(
                      width: 85,
                      height: 85,
                      padding: const EdgeInsets.all(12.0),
                      clipBehavior: Clip.antiAlias,
                      decoration: ShapeDecoration(
                        color: const Color(0xFFFFC400), // Color amarillo destacado
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.0),
                        ),
                        // Sombra para dar efecto de elevación
                        shadows: const [
                          BoxShadow(
                            color: Color(0x3F000000),
                            blurRadius: 5.88,
                            offset: Offset(0, 2.94),
                            spreadRadius: 0,
                          )
                        ],
                      ),
                      child: Icon(
                        selectedIcon,
                        size: 40.0,
                        color: const Color(0xFF104641),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );    } else {
      // Botones laterales con diseño estándar
      return GestureDetector(
        onTap: () => onTap(index),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  // Círculo de fondo cuando está seleccionado
                  if (isSelected)
                    Container(
                      width: 56,
                      height: 56,
                      decoration: const BoxDecoration(
                        color: Color(0xFFBCE3E0),
                        shape: BoxShape.circle,
                      ),
                    ),
                  
                  // Icono del botón
                  Icon(
                    isSelected ? selectedIcon : icon,
                    size: 26.67,
                    color: const Color(0xFF104641),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              
              // Etiqueta del botón
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF104641),
                  fontSize: 12,
                  fontFamily: 'Open Sans',
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      );
    }
  }
}