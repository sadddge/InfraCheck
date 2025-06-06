/**
 * @enum {string} ReportState
 * @description Enumeration defining the lifecycle states of infrastructure reports.
 * These states track the progress of reported issues from initial submission
 * through final resolution, enabling workflow management, user notifications,
 * and administrative oversight of the report resolution process.
 *
 * @example
 * ```typescript
 * // Initial report state
 * const newReport = new Report();
 * newReport.state = ReportState.PENDING;
 *
 * // State transition workflow
 * if (report.state === ReportState.PENDING) {
 *   report.state = ReportState.IN_PROGRESS;
 *   notifyUser("Your report is now being addressed");
 * }
 *
 * // Filtering reports by state
 * const activeReports = reports.filter(r =>
 *   r.state === ReportState.PENDING || r.state === ReportState.IN_PROGRESS
 * );
 * ```
 *
 * @since 1.0.0
 */
export enum ReportState {
    /**
     * @description Initial state for newly submitted reports awaiting review.
     * Reports in this state are queued for administrative assessment and
     * assignment to appropriate departments. Default state for all new reports.
     *
     * @example Report submitted by user, waiting for admin review and assignment
     */
    PENDING = 'PENDING',

    /**
     * @description Active state indicating the report is being addressed.
     * Work has been assigned and is underway, with maintenance crews or
     * appropriate departments actively working on resolving the issue.
     *
     * @example Maintenance crew dispatched, work order created, repair in progress
     */
    IN_PROGRESS = 'IN_PROGRESS',

    /**
     * @description Final state indicating the reported issue has been successfully
     * addressed and completed. The infrastructure problem has been fixed and
     * the report can be closed with resolution documentation.
     *
     * @example Pothole filled, streetlight repaired, issue fully resolved
     */
    RESOLVED = 'RESOLVED',

    /**
     * @description Final state for reports that are not actionable or appropriate.
     * Used for duplicate reports, insufficient information, outside jurisdiction,
     * or reports that don't meet criteria for municipal action.
     *
     * @example Duplicate report, private property issue, insufficient details provided
     */
    REJECTED = 'REJECTED',
}
