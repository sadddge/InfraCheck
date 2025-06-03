/**
 * @enum {string} ReportCategory
 * @description Enumeration defining the main categories for infrastructure reports.
 * These categories help organize and route reports to appropriate departments,
 * enable filtering and search functionality, and provide statistical analysis
 * of community infrastructure concerns by problem type.
 *
 * @example
 * ```typescript
 * // Categorizing a new report
 * const report = new Report();
 * report.category = ReportCategory.INFRASTRUCTURE;
 *
 * // Filtering reports by category
 * const securityReports = reports.filter(r =>
 *   r.category === ReportCategory.SECURITY
 * );
 *
 * // Department routing based on category
 * const department = getDepartmentByCategory(report.category);
 * ```
 *
 * @since 1.0.0
 */
export enum ReportCategory {
    /**
     * @description Security-related issues including broken lights, unsafe areas,
     * vandalism, suspicious activities, or any safety concerns that could
     * compromise public security and require police or security department attention.
     *
     * @example "Broken streetlight creating dark area", "Damaged fence allowing unauthorized access"
     */
    SECURITY = 'SECURITY',

    /**
     * @description General infrastructure problems including roads, bridges,
     * sidewalks, buildings, utilities, and structural issues that require
     * public works or engineering department intervention.
     *
     * @example "Pothole on Main Street", "Cracked sidewalk", "Water pipe leak"
     */
    INFRASTRUCTURE = 'INFRASTRUCTURE',

    /**
     * @description Transportation and transit-related issues including public
     * transportation problems, traffic signals, road signage, bus stops,
     * and mobility infrastructure requiring transportation department attention.
     *
     * @example "Bus stop shelter damaged", "Traffic light malfunction", "Missing stop sign"
     */
    TRANSIT = 'TRANSIT',

    /**
     * @description Waste management and sanitation issues including overflowing
     * bins, missed collections, illegal dumping, recycling problems, and
     * cleanliness concerns requiring sanitation department response.
     *
     * @example "Overflowing garbage bin", "Illegal dumping site", "Missed recycling pickup"
     */
    GARBAGE = 'GARBAGE',
}
