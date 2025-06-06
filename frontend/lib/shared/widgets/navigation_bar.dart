import 'package:flutter/material.dart';

class InfraNavigationBar extends StatelessWidget {
  final int currentIndex;
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
        ),        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
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

class _NavigationItem extends StatelessWidget {
  final int index;
  final int currentIndex;
  final Function(int) onTap;
  final IconData icon;
  final IconData selectedIcon;
  final String label;
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
      // Botón central especial (Reportar)
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.only(bottom: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: () => onTap(index),
              child: Container(
                padding: const EdgeInsets.all(20.75),
                clipBehavior: Clip.antiAlias,
                decoration: ShapeDecoration(
                  color: const Color(0xFFFFC400),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14.10),
                  ),
                  shadows: const [
                    BoxShadow(
                      color: Color(0x3F000000),
                      blurRadius: 5.88,
                      offset: Offset(0, 2.94),
                      spreadRadius: 0,
                    )
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Icon(
                      selectedIcon,
                      size: 40.0,
                      color: const Color(0xFF104641),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 4),
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
      );
    } else {
      // Botones laterales normales
      return GestureDetector(
        onTap: () => onTap(index),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          clipBehavior: Clip.antiAlias,
          decoration: const BoxDecoration(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: double.infinity,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      width: double.infinity,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Círculo de fondo cuando está seleccionado
                          if (isSelected)
                            Container(
                              width: 56,
                              height: 56,
                              decoration: const ShapeDecoration(
                                color: Color(0xFFBCE3E0),
                                shape: OvalBorder(),
                              ),
                            ),
                          // Icono
                          Container(
                            width: 40,
                            height: 40,
                            padding: const EdgeInsets.all(6.67),
                            child: Icon(
                              isSelected ? selectedIcon : icon,
                              size: 26.67,
                              color: const Color(0xFF104641),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    // Texto del label
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
            ],
          ),
        ),
      );
    }
  }
}
