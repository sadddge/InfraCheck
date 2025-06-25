import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import '../../../core/models/report_model.dart';
import '../../../features/camera/domain/models/photo_entry.dart';
import '../domain/reports_provider.dart';

/// Pantalla para crear un nuevo reporte de infraestructura.
/// 
/// Implementa el diseño de Figma exactamente, permitiendo al usuario:
/// - Ingresar título del reporte
/// - Seleccionar categoría del problema
/// - Escribir descripción detallada
/// - Ver las fotos seleccionadas previamente
/// - Publicar el reporte con geolocalización
/// 
/// La pantalla recibe las fotos desde la galería/cámara y permite
/// crear un reporte completo que aparecerá como pin en el mapa.
class CreateReportScreen extends StatefulWidget {
  /// Lista de fotos seleccionadas para el reporte
  final List<PhotoEntry> selectedPhotos;

  const CreateReportScreen({
    super.key,
    required this.selectedPhotos,
  });

  @override
  State<CreateReportScreen> createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends State<CreateReportScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  
  ReportCategory? _selectedCategory;
  bool _isSubmitting = false;

  final List<ReportCategory> _categories = [
    ReportCategory.infrastructure,
    ReportCategory.security,
    ReportCategory.transit,
    ReportCategory.garbage,
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  String _getCategoryDisplayName(ReportCategory category) {
    switch (category) {
      case ReportCategory.infrastructure:
        return 'Infraestructura';
      case ReportCategory.security:
        return 'Seguridad';
      case ReportCategory.transit:
        return 'Transporte';
      case ReportCategory.garbage:
        return 'Basura';
    }
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate() || _selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor completa todos los campos'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final reportsProvider = Provider.of<ReportsProvider>(context, listen: false);
      
      await reportsProvider.createReport(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        category: _selectedCategory!,
        photos: widget.selectedPhotos,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                const Text('Reporte creado exitosamente'),
              ],
            ),
            backgroundColor: Colors.green,
          ),
        );

        // Volver al mapa principal
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al crear reporte: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFDFA),
      body: Form(
        key: _formKey,
        child: Container(
          width: double.infinity,
          height: MediaQuery.of(context).size.height,
          child: Stack(
            children: [
              // Contenido principal
              Positioned(
                left: 0,
                top: 50,
                child: Container(
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).size.height - 50,
                  padding: const EdgeInsets.all(24),
                  child: Stack(
                    children: [
                      // Header con icono y título
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox(height: 6),
                          // Icono amarillo
                          Container(
                            padding: const EdgeInsets.all(6),
                            clipBehavior: Clip.antiAlias,
                            decoration: ShapeDecoration(
                              color: const Color(0xFFFFC400),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(7.2),
                              ),
                              shadows: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.25),
                                  blurRadius: 3,
                                  offset: const Offset(0, 1.5),
                                ),
                              ],
                            ),
                            child: Icon(
                              Icons.report_problem,
                              color: const Color(0xFF104641),
                              size: 20,
                            ),
                          ),
                          const SizedBox(height: 6),
                          // Título
                          Text(
                            'Crear Reporte',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: const Color(0xFF104641),
                              fontSize: 22,
                              fontFamily: 'Open Sans',
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      
                      // Formulario
                      Positioned(
                        top: 80,
                        left: 0,
                        right: 0,
                        bottom: 80,
                        child: SingleChildScrollView(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 32),
                              
                              // Campo Título
                              _buildFormField(
                                label: 'Título',
                                height: 46,
                                child: TextFormField(
                                  controller: _titleController,
                                  style: TextStyle(
                                    color: const Color(0xFF104641),
                                    fontSize: 13,
                                    fontFamily: 'Work Sans',
                                    fontWeight: FontWeight.w400,
                                    letterSpacing: -0.26,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: 'Ingresa el título del reporte',
                                    hintStyle: TextStyle(
                                      color: const Color(0xFF6C7278),
                                      fontSize: 13,
                                      fontFamily: 'Work Sans',
                                      fontWeight: FontWeight.w400,
                                      letterSpacing: -0.26,
                                    ),
                                    border: InputBorder.none,
                                    contentPadding: EdgeInsets.zero,
                                  ),
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'El título es requerido';
                                    }
                                    if (value.trim().length < 5) {
                                      return 'El título debe tener al menos 5 caracteres';
                                    }
                                    if (value.trim().length > 100) {
                                      return 'El título no puede exceder 100 caracteres';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              
                              const SizedBox(height: 32),
                              
                              // Campo Categoría
                              _buildFormField(
                                label: 'Categoria',
                                height: 46,
                                child: DropdownButtonFormField<ReportCategory>(
                                  value: _selectedCategory,
                                  style: TextStyle(
                                    color: const Color(0xFF104641),
                                    fontSize: 13,
                                    fontFamily: 'Work Sans',
                                    fontWeight: FontWeight.w400,
                                    letterSpacing: -0.26,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: 'Selecciona la categoria',
                                    hintStyle: TextStyle(
                                      color: const Color(0xFF104641),
                                      fontSize: 13,
                                      fontFamily: 'Work Sans',
                                      fontWeight: FontWeight.w400,
                                      letterSpacing: -0.26,
                                    ),
                                    border: InputBorder.none,
                                    contentPadding: EdgeInsets.zero,
                                    suffixIcon: Icon(
                                      Icons.keyboard_arrow_down,
                                      color: const Color(0xFF104641),
                                    ),
                                  ),
                                  items: _categories.map((category) {
                                    return DropdownMenuItem<ReportCategory>(
                                      value: category,
                                      child: Text(_getCategoryDisplayName(category)),
                                    );
                                  }).toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedCategory = value;
                                    });
                                  },
                                  validator: (value) {
                                    if (value == null) {
                                      return 'La categoría es requerida';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              
                              const SizedBox(height: 32),
                              
                              // Campo Descripción
                              _buildFormField(
                                label: 'Descripción',
                                height: 124,
                                child: TextFormField(
                                  controller: _descriptionController,
                                  style: TextStyle(
                                    color: const Color(0xFF104641),
                                    fontSize: 13,
                                    fontFamily: 'Work Sans',
                                    fontWeight: FontWeight.w400,
                                    letterSpacing: -0.26,
                                  ),
                                  maxLines: null,
                                  expands: true,
                                  textAlignVertical: TextAlignVertical.top,
                                  decoration: InputDecoration(
                                    hintText: 'Ingresa una descripción del reporte',
                                    hintStyle: TextStyle(
                                      color: const Color(0xFF6C7278),
                                      fontSize: 13,
                                      fontFamily: 'Work Sans',
                                      fontWeight: FontWeight.w400,
                                      letterSpacing: -0.26,
                                    ),
                                    border: InputBorder.none,
                                    contentPadding: EdgeInsets.zero,
                                  ),
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'La descripción es requerida';
                                    }
                                    if (value.trim().length < 20) {
                                      return 'La descripción debe tener al menos 20 caracteres';
                                    }
                                    if (value.trim().length > 1000) {
                                      return 'La descripción no puede exceder 1000 caracteres';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              
                              const SizedBox(height: 32),
                              
                              // Galería de fotos
                              _buildPhotosGallery(),
                            ],
                          ),
                        ),
                      ),
                      
                      // Botón Publicar (fijo en la parte inferior)
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        child: Container(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _isSubmitting ? null : _submitReport,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFFC400),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 2,
                              shadowColor: Colors.black.withOpacity(0.15),
                            ),
                            child: _isSubmitting
                                ? Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(
                                            const Color(0xFF104641),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Text(
                                        'Publicando...',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: const Color(0xFF104641),
                                          fontSize: 16,
                                          fontFamily: 'Open Sans',
                                          fontWeight: FontWeight.w700,
                                          height: 1,
                                        ),
                                      ),
                                    ],
                                  )
                                : Text(
                                    'Publicar',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: const Color(0xFF104641),
                                      fontSize: 16,
                                      fontFamily: 'Open Sans',
                                      fontWeight: FontWeight.w700,
                                      height: 1,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              // Botón de regreso
              Positioned(
                left: 16,
                top: 32,
                child: Container(
                  width: 32,
                  height: 32,
                  child: IconButton(
                    onPressed: () => context.pop(),
                    icon: Icon(
                      Icons.arrow_back,
                      color: const Color(0xFF104641),
                    ),
                    padding: EdgeInsets.zero,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFormField({
    required String label,
    required double height,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          height: 21,
          decoration: ShapeDecoration(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(100),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: const Color(0xFF155B55),
                  fontSize: 13,
                  fontFamily: 'Open Sans',
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.26,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 2),
        Container(
          width: double.infinity,
          height: height,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          clipBehavior: Clip.antiAlias,
          decoration: ShapeDecoration(
            color: Colors.white,
            shape: RoundedRectangleBorder(
              side: BorderSide(
                width: 1,
                color: const Color(0xFFC9D6CE),
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            shadows: [
              BoxShadow(
                color: const Color(0x3DE4E5E7),
                blurRadius: 2,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: child,
        ),
      ],
    );
  }

  Widget _buildPhotosGallery() {
    if (widget.selectedPhotos.isEmpty) {
      return Container(
        height: 120,
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: const Color(0xFFC9D6CE),
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.photo_library_outlined,
                size: 40,
                color: Colors.grey.shade400,
              ),
              const SizedBox(height: 8),
              Text(
                'No hay fotos seleccionadas',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      height: 129.42,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Foto principal (primera foto)
          Expanded(
            child: Container(
              height: 129.42,
              decoration: ShapeDecoration(
                image: DecorationImage(
                  image: FileImage(File(widget.selectedPhotos[0].filePath)),
                  fit: BoxFit.cover,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(7.2),
                ),
                shadows: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
            ),
          ),
          
          if (widget.selectedPhotos.length > 1) ...[
            const SizedBox(width: 8),
            // Columna con fotos adicionales
            Container(
              height: double.infinity,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Segunda foto
                  Expanded(
                    child: Container(
                      width: 107.63,
                      decoration: ShapeDecoration(
                        image: DecorationImage(
                          image: FileImage(File(widget.selectedPhotos[1].filePath)),
                          fit: BoxFit.cover,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(3.6),
                        ),
                        shadows: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 2,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  if (widget.selectedPhotos.length > 2) ...[
                    const SizedBox(height: 8),
                    // Tercera foto o contador
                    Expanded(
                      child: Container(
                        clipBehavior: Clip.antiAlias,
                        decoration: ShapeDecoration(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        child: Stack(
                          children: [
                            Container(
                              width: 107.63,
                              decoration: ShapeDecoration(
                                image: DecorationImage(
                                  image: FileImage(File(widget.selectedPhotos[2].filePath)),
                                  fit: BoxFit.cover,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(3.6),
                                ),
                                shadows: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 2,
                                    offset: const Offset(0, 1),
                                  ),
                                ],
                              ),
                            ),
                            
                            // Overlay con contador si hay más de 3 fotos
                            if (widget.selectedPhotos.length > 3)
                              Positioned.fill(
                                child: Container(
                                  clipBehavior: Clip.antiAlias,
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.6),
                                    borderRadius: BorderRadius.circular(3.6),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '+${widget.selectedPhotos.length - 2}',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 20,
                                        fontFamily: 'Open Sans',
                                        fontWeight: FontWeight.w700,
                                        height: 1,
                                        letterSpacing: -0.4,
                                        shadows: [
                                          Shadow(
                                            offset: const Offset(0, 4),
                                            blurRadius: 4,
                                            color: Colors.black.withOpacity(0.25),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
