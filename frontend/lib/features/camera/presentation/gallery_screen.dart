import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme/colors.dart';
import '../domain/camera_provider.dart';

class GalleryScreen extends StatefulWidget {
  const GalleryScreen({super.key});

  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> {
  final Set<int> _selectedPhotos = <int>{};
  bool _isSelectionMode = false;

  void _togglePhotoSelection(int index) {
    setState(() {
      if (_selectedPhotos.contains(index)) {
        _selectedPhotos.remove(index);
        if (_selectedPhotos.isEmpty) {
          _isSelectionMode = false;
        }
      } else {
        _selectedPhotos.add(index);
        _isSelectionMode = true;
      }
    });
  }

  void _clearSelection() {
    setState(() {
      _selectedPhotos.clear();
      _isSelectionMode = false;
    });
  }

  void _deleteSelectedPhotos() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Eliminar fotos'),
          content: Text(
            '¿Estás seguro de que quieres eliminar ${_selectedPhotos.length} foto${_selectedPhotos.length > 1 ? 's' : ''}?'
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            TextButton(              onPressed: () async {
                final provider = context.read<CameraProvider>();
                final photosToDelete = _selectedPhotos.toList()..sort((a, b) => b.compareTo(a));
                
                for (int index in photosToDelete) {
                  if (index < provider.photos.length) {
                    await provider.deletePhoto(index);
                  }
                }
                
                _clearSelection();
                if (mounted) {
                  Navigator.of(context).pop();
                }
              },
              child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }

  void _goToReportCreation() {
    // Aquí implementarías la navegación a la creación del reporte
    // con las fotos seleccionadas
    final selectedPhotosList = _selectedPhotos.toList();
    debugPrint('Crear reporte con fotos en índices: $selectedPhotosList');
    
    // Por ahora solo mostramos un SnackBar
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Crear reporte con ${_selectedPhotos.length} fotos'),
        backgroundColor: AppColors.primary,
      ),
    );
  }
  Future<bool> _onWillPop() async {
    // Si está en modo selección, primero limpiar selección
    if (_isSelectionMode) {
      _clearSelection();
      
      // Mostrar feedback al usuario
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Selección cancelada'),
            backgroundColor: Colors.grey[700],
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            duration: const Duration(seconds: 1),
          ),
        );
      }
      
      return false; // No salir, solo limpiar selección
    }
    
    // Si no hay selección, permitir salir normalmente
    return true;
  }
  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false, // Interceptar el botón de atrás
      onPopInvokedWithResult: (bool didPop, Object? result) async {
        if (didPop) return;
        
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          context.go('/camera');
        }
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () {
              if (_isSelectionMode) {
                _clearSelection();
              } else {
                context.go('/camera');
              }
            },
          ),
          title: Text(
            _isSelectionMode ? '${_selectedPhotos.length} seleccionada${_selectedPhotos.length > 1 ? 's' : ''}' : 'Galería',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          actions: [
            if (_isSelectionMode) ...[
              IconButton(
                icon: const Icon(Icons.delete, color: Colors.red),
                onPressed: _deleteSelectedPhotos,
                tooltip: 'Eliminar seleccionadas',
              ),
            ] else ...[
              IconButton(
                icon: const Icon(Icons.camera_alt, color: Colors.white),
                onPressed: () => context.go('/camera'),
                tooltip: 'Ir a Cámara',
              ),
            ],
          ],
        ),
        body: Consumer<CameraProvider>(
          builder: (context, provider, child) {
            if (provider.photos.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [                  Icon(
                      Icons.photo_library_outlined,
                      size: 80,
                      color: Colors.grey[600],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No hay fotos',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey[300],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Usa la cámara para capturar fotos de infraestructura',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[400],
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => context.go('/camera'),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Ir a Cámara'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: [
                // Grid de fotos
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(2),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 2,
                      mainAxisSpacing: 2,
                      childAspectRatio: 1,
                    ),
                    itemCount: provider.photos.length,
                    itemBuilder: (context, index) {
                      final photo = provider.photos[index];
                      final isSelected = _selectedPhotos.contains(index);
                      
                      return GestureDetector(
                        onTap: () => _togglePhotoSelection(index),
                        onLongPress: () => _togglePhotoSelection(index),
                        child: Stack(
                          children: [
                            // Imagen
                            Container(                            decoration: BoxDecoration(
                                border: isSelected 
                                    ? Border.all(color: AppColors.accent, width: 3)
                                    : null,
                              ),
                              child: Image.file(
                                File(photo.filePath),
                                fit: BoxFit.cover,
                                width: double.infinity,
                                height: double.infinity,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    color: Colors.grey[300],
                                    child: Icon(
                                      Icons.broken_image,
                                      color: Colors.grey[500],
                                      size: 40,
                                    ),
                                  );
                                },
                              ),
                            ),
                              // Overlay de selección
                            if (isSelected)
                              Container(
                                color: AppColors.accent.withOpacity(0.3),
                                child: const Center(
                                  child: Icon(
                                    Icons.check_circle,
                                    color: Colors.white,
                                    size: 30,
                                  ),
                                ),
                              ),
                            
                            // Número de selección
                            if (isSelected)
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color: AppColors.accent,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.black, width: 2),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${_selectedPhotos.toList().indexOf(index) + 1}',
                                      style: const TextStyle(
                                        color: Colors.black,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
                ),                  // Barra inferior con fotos seleccionadas
                if (_isSelectionMode)
                  SafeArea(
                    top: false,
                    child: Container(
                      height: 84, // Reducida de 100 a 84 para mejor proporción
                      decoration: BoxDecoration(
                        color: Colors.grey[900],
                        border: Border(
                          top: BorderSide(color: Colors.grey[700]!, width: 1),
                        ),
                      ),
                      child: Row(
                        children: [
                          // Lista horizontal de fotos seleccionadas
                          Expanded(
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                              itemCount: _selectedPhotos.length,
                              itemBuilder: (context, index) {
                                final selectedIndex = _selectedPhotos.elementAt(index);
                                final photo = provider.photos[selectedIndex];
                                
                                return Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  width: 68, // Ajustado para que sea cuadrado perfecto
                                  height: 68, // Ajustado para que sea cuadrado perfecto
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: AppColors.accent, width: 2),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: Stack(
                                      children: [
                                        Image.file(
                                          File(photo.filePath),
                                          fit: BoxFit.cover,
                                          width: 68,
                                          height: 68,
                                          errorBuilder: (context, error, stackTrace) {
                                            return Container(
                                              color: Colors.grey[700],
                                              child: Icon(
                                                Icons.broken_image,
                                                color: Colors.grey[400],
                                                size: 20,
                                              ),
                                            );
                                          },
                                        ),
                                        // Botón para quitar de selección
                                        Positioned(
                                          top: 2,
                                          right: 2,
                                          child: GestureDetector(
                                            onTap: () => _togglePhotoSelection(selectedIndex),
                                            child: Container(
                                              width: 20,
                                              height: 20,
                                              decoration: BoxDecoration(
                                                color: Colors.red,
                                                shape: BoxShape.circle,
                                                border: Border.all(color: Colors.white, width: 1),
                                              ),
                                              child: const Icon(
                                                Icons.close,
                                                color: Colors.white,
                                                size: 12,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          
                          // Botón "Siguiente"
                          Container(
                            margin: const EdgeInsets.all(8),
                            child: TextButton(
                              onPressed: _selectedPhotos.isNotEmpty ? _goToReportCreation : null,
                              child: Text(
                                'Siguiente',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: _selectedPhotos.isNotEmpty ? AppColors.accent : Colors.grey[600],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),              ],
            );
          },
        ),
      ),
    );
  }
}
