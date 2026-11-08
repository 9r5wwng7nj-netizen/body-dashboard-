/** Agent C architecture contract v0.1, 2026-11-07. Not an application implementation.
 * Physical Watermelon columns; id/_status/_changed belong to WatermelonDB.
 * SQL/JSON validators and repository implementations remain Agent D work.
 */
type ColumnKind = 'string' | 'number' | 'boolean';
type Column<K extends ColumnKind, O extends boolean = false> = Readonly<{
  type: K; isOptional: O; isIndexed: boolean;
}>;
const s = <O extends boolean = false>(optional = false as O, indexed = false): Column<'string', O> =>
  ({ type: 'string', isOptional: optional, isIndexed: indexed });
const n = <O extends boolean = false>(optional = false as O, indexed = false): Column<'number', O> =>
  ({ type: 'number', isOptional: optional, isIndexed: indexed });
const b = (indexed = false): Column<'boolean'> => ({ type: 'boolean', isOptional: false, isIndexed: indexed });
const audit = { created_at: n(), updated_at: n(), revision: n() } as const;
const owned = { ...audit, workspace_id: s(false, true), athlete_id: s(false, true),
  created_by_actor_id: s(), updated_by_actor_id: s() } as const;
const visible = { ...owned, publication_batch_id: s(false, true) } as const;

export const CONTRACT_VERSION = 'body-dashboard-domain-0.1' as const;
export const SCHEMA_VERSION = 1 as const;
export const TABLES = {
  actors: { ...audit, device_actor_key: s(false, true), display_label: s(), principal_id: s(true) },
  workspaces: { ...audit, owner_actor_id: s(false, true), label: s(), claim_state: s() },
  athletes: { ...audit, workspace_id: s(false, true), owner_actor_id: s(false, true), label: s() },
  identity_claims: { ...audit, workspace_id: s(false, true), actor_id: s(false, true), principal_id: s(true),
    claim_nonce_hash: s(), state: s(), server_binding_id: s(true) },
  access_grants: { ...owned, grantee_principal_id: s(false, true), granted_by_principal_id: s(),
    capabilities_json: s(), state: s(), authority_version: n(), expires_at: n(true) },
  publication_batches: { ...owned, state: s(), kind: s(), committed_at: n(true), import_job_id: s(true, true) },
  athlete_runtime: { ...owned, active_session_id: s(true, true), timer_id: s(true), reporting_timezone: s(),
    preferences_json: s(), is_recovery_required: b() },
  exercises: { ...visible, label: s(), tracking_type: s(), variant: s(), equipment: s(), load_basis: s(),
    is_archived: b() },
  exercise_aliases: { ...visible, exercise_id: s(false, true), source_key: s(false, true),
    original_label: s(), reviewed_mapping_json: s() },
  routines: { ...visible, label: s(), head_version_id: s(true, true), is_archived: b(),
    legacy_key: s(true, true), legacy_provenance_json: s(true) },
  routine_versions: { ...visible, routine_id: s(false, true), version_number: n(), label: s(),
    prescription_json: s(), source_payload_json: s(true) },
  routine_exercises: { ...visible, routine_version_id: s(false, true), exercise_id: s(true, true),
    position: n(), snapshot_json: s(), targets_json: s(), superset_group_key: s(true) },
  sessions: { ...visible, head_version_id: s(true, true), origin_routine_version_id: s(true, true),
    legacy_key: s(true, true), legacy_provenance_json: s(true) },
  session_versions: { ...visible, session_id: s(false, true), parent_version_id: s(true),
    operation_id: s(false, true), state: s(), label: s(), started_at: n(true), ended_at: n(true),
    recorded_day: s(false, true), timezone: s(true), timezone_provenance: s(), notes: s(),
    source_payload_json: s(true) },
  session_exercises: { ...visible, session_id: s(false, true), exercise_id: s(true, true), position: n(),
    label_snapshot: s(), tracking_type: s(), variant_snapshot: s(), equipment_snapshot: s(),
    load_basis_snapshot: s(), superset_group_key: s(true), plan_snapshot_json: s(), is_removed: b() },
  sets: { ...visible, session_id: s(false, true), session_exercise_id: s(false, true), position: n(),
    head_observation_id: s(true, true), suggestion_json: s(true) },
  set_observations: { ...visible, set_id: s(false, true), session_id: s(false, true),
    session_exercise_id: s(false, true), parent_observation_id: s(true), operation_id: s(false, true),
    exercise_id_snapshot: s(true, true), exercise_label: s(), variant: s(), equipment: s(),
    state: s(), set_kind: s(), tracking_type: s(), load_basis: s(),
    load_kg: n(true), reps: n(true), duration_s: n(true), distance_m: n(true), rpe: n(true),
    performed_at: n(true), accepted_at: n(), notes: s(), source_payload_json: s(true) },
  set_drafts: { ...owned, set_id: s(false, true), session_id: s(false, true),
    baseline_head_id: s(true), editor_revision: n(), raw_fields_json: s(), checkpointed_at: n() },
  subjective_observations: { ...visible, session_id: s(false, true), session_exercise_id: s(true, true),
    set_id: s(true, true), supersedes_id: s(true), kind: s(), rpe: n(true), location: s(true),
    side: s(true), category: s(true), severity: n(true), severity_scale: s(true), notes: s(),
    observed_at: n(), is_retracted: b() },
  rest_timers: { ...owned, session_id: s(false, true), source_operation_id: s(true),
    intent_at: n(), deadline_at: n(), duration_s: n(), monotonic_anchor_ms: n(true),
    boot_token: s(true), is_cancelled: b(), notification_id: s(true), notification_state: s() },
  foods: { ...visible, label: s(), head_version_id: s(true, true), is_archived: b() },
  food_versions: { ...visible, food_id: s(false, true), version_number: n(), label: s(),
    basis_quantity: n(), basis_unit: s(), conversion_json: s(), energy_kcal: n(true), protein_g: n(true),
    carbs_g: n(true), fat_g: n(true), source_json: s() },
  saved_meals: { ...visible, label: s(), head_version_id: s(true, true), is_archived: b() },
  saved_meal_versions: { ...visible, saved_meal_id: s(false, true), version_number: n(), label: s(),
    servings: n(), constituents_json: s(), source_json: s() },
  food_entries: { ...visible, head_version_id: s(true, true), meal_instance_key: s(true, true) },
  food_entry_versions: { ...visible, food_entry_id: s(false, true), parent_version_id: s(true),
    operation_id: s(false, true), state: s(), recorded_day: s(false, true), timezone: s(true),
    timezone_provenance: s(), meal: s(), label: s(), quantity: n(), unit: s(), basis_json: s(),
    food_version_id: s(true, true), saved_meal_version_id: s(true, true),
    energy_kcal: n(true), protein_g: n(true), carbs_g: n(true), fat_g: n(true), source_json: s() },
  diet_days: { ...owned, recorded_day: s(false, true), coverage_json: s() },
  target_versions: { ...visible, effective_day: s(false, true), energy_kcal: n(true), protein_g: n(true),
    carbs_g: n(true), fat_g: n(true), supersedes_id: s(true), source_json: s() },
  weigh_ins: { ...visible, head_version_id: s(true, true) },
  weigh_in_versions: { ...visible, weigh_in_id: s(false, true), parent_version_id: s(true),
    operation_id: s(false, true), state: s(), weight_kg: n(true), measured_at: n(true),
    recorded_day: s(false, true), timezone: s(true), timezone_provenance: s(), source_json: s() },
  weight_day_choices: { ...owned, recorded_day: s(false, true), primary_weigh_in_id: s(true, true) },
  import_sources: { ...owned, namespace_key: s(false, true), label: s(), source_app: s() },
  import_jobs: { ...owned, source_id: s(false, true), publication_batch_id: s(false, true),
    format: s(), file_sha256: s(), importer_version: s(), phase: s(), options_json: s(),
    source_counts_json: s(), result_json: s(true), last_stage_ordinal: n() },
  import_records: { ...owned, source_id: s(false, true), identity_key: s(false, true), source_record_id: s(true),
    accepted_content_hash: s(), accepted_native_heads_json: s(), native_root_id: s(true),
    generation: n(), last_committed_job_id: s(true, true) },
  import_items: { ...owned, job_id: s(false, true), ordinal: n(), identity_key: s(false, true),
    content_hash: s(), disposition: s(), issue_json: s(), raw_training_json: s(),
    proposed_mapping_json: s(), expected_native_heads_json: s() },
  source_id_maps: { ...owned, source_id: s(false, true), identity_key: s(false, true),
    source_record_key: s(), source_path: s(), generation: n(), native_table: s(), native_id: s(),
    job_id: s(false, true), is_committed: b() },
  command_intents: { ...owned, operation_key: s(false, true), payload_hash: s(), command_name: s(),
    payload_json: s(), phase: s(), failure_code: s(true) },
  command_receipts: { ...owned, operation_key: s(false, true), payload_hash: s(),
    result_json: s(), committed_at: n() },
  projection_epochs: { ...owned, projection_key: s(false, true), watermark: n(), earliest_dirty_day: s(true) },
  derived_caches: { ...owned, cache_key: s(false, true), algorithm_version: s(), source_watermark: n(),
    value_json: s() },
  conflict_reviews: { ...owned, target_table: s(), target_id: s(), base_head_id: s(true),
    local_head_id: s(true), remote_head_id: s(true), state: s(), resolution_head_id: s(true) },
} as const;

export type TableName = keyof typeof TABLES;
type Scalar<C> = C extends Column<infer K, infer O>
  ? (K extends 'number' ? number : K extends 'boolean' ? boolean : string) | (O extends true ? null : never)
  : never;
export type Row<T extends TableName> = Readonly<{ id: string } & {
  [K in keyof (typeof TABLES)[T]]: Scalar<(typeof TABLES)[T][K]>
}>;
export const LOCAL_ONLY_TABLES = [
  'identity_claims', 'athlete_runtime', 'set_drafts', 'rest_timers', 'import_sources', 'import_jobs',
  'import_records', 'import_items', 'source_id_maps', 'command_intents', 'command_receipts',
  'projection_epochs', 'derived_caches', 'conflict_reviews',
] as const satisfies readonly TableName[];
export const IMMUTABLE_TABLES = [
  'routine_versions', 'routine_exercises', 'session_versions', 'set_observations', 'food_versions',
  'saved_meal_versions', 'food_entry_versions', 'weigh_in_versions', 'target_versions', 'subjective_observations',
] as const satisfies readonly TableName[];

/** Relationships: [child table, FK, parent table, scope rule].
 * These are domain FK contracts, not a blindly generated Model.associations object:
 * multiple links to one table require explicit head lookups/canonical join associations.
 * 'same' means workspace AND athlete must agree, not just a valid parent ID.
 * Runtime checks also validate the head's back-reference and publication visibility.
 */
export const RELATIONS = [
  ['workspaces','owner_actor_id','actors','global'],
  ['athletes','workspace_id','workspaces','workspace'],
  ['athletes','owner_actor_id','actors','global'],
  ['identity_claims','actor_id','actors','global'],
  ['identity_claims','workspace_id','workspaces','workspace'],
  ['publication_batches','import_job_id','import_jobs','same'],
  ['athlete_runtime','active_session_id','sessions','same'],
  ['athlete_runtime','timer_id','rest_timers','same'],
  ['exercise_aliases','exercise_id','exercises','same'],
  ['routines','head_version_id','routine_versions','same'],
  ['routine_versions','routine_id','routines','same'],
  ['routine_exercises','routine_version_id','routine_versions','same'],
  ['routine_exercises','exercise_id','exercises','same'],
  ['sessions','head_version_id','session_versions','same'],
  ['sessions','origin_routine_version_id','routine_versions','same'],
  ['session_versions','session_id','sessions','same'],
  ['session_versions','parent_version_id','session_versions','same'],
  ['session_exercises','session_id','sessions','same'],
  ['session_exercises','exercise_id','exercises','same'],
  ['sets','session_id','sessions','same'],
  ['sets','session_exercise_id','session_exercises','same'],
  ['sets','head_observation_id','set_observations','same'],
  ['set_observations','set_id','sets','same'],
  ['set_observations','session_id','sessions','same'],
  ['set_observations','session_exercise_id','session_exercises','same'],
  ['set_observations','exercise_id_snapshot','exercises','same'],
  ['set_observations','parent_observation_id','set_observations','same'],
  ['set_drafts','set_id','sets','same'], ['set_drafts','session_id','sessions','same'],
  ['subjective_observations','session_id','sessions','same'],
  ['subjective_observations','session_exercise_id','session_exercises','same'],
  ['subjective_observations','set_id','sets','same'],
  ['subjective_observations','supersedes_id','subjective_observations','same'],
  ['rest_timers','session_id','sessions','same'],
  ['foods','head_version_id','food_versions','same'], ['food_versions','food_id','foods','same'],
  ['saved_meals','head_version_id','saved_meal_versions','same'],
  ['saved_meal_versions','saved_meal_id','saved_meals','same'],
  ['food_entries','head_version_id','food_entry_versions','same'],
  ['food_entry_versions','food_entry_id','food_entries','same'],
  ['food_entry_versions','parent_version_id','food_entry_versions','same'],
  ['food_entry_versions','food_version_id','food_versions','same'],
  ['food_entry_versions','saved_meal_version_id','saved_meal_versions','same'],
  ['target_versions','supersedes_id','target_versions','same'],
  ['weigh_ins','head_version_id','weigh_in_versions','same'],
  ['weigh_in_versions','weigh_in_id','weigh_ins','same'],
  ['weigh_in_versions','parent_version_id','weigh_in_versions','same'],
  ['weight_day_choices','primary_weigh_in_id','weigh_ins','same'],
  ['import_jobs','source_id','import_sources','same'],
  ['import_jobs','publication_batch_id','publication_batches','same'],
  ['import_records','source_id','import_sources','same'],
  ['import_records','last_committed_job_id','import_jobs','same'],
  ['import_items','job_id','import_jobs','same'],
  ['source_id_maps','source_id','import_sources','same'], ['source_id_maps','job_id','import_jobs','same'],
] as const;
// In addition, every owned.workspace_id -> workspaces and owned.athlete_id -> athletes;
// every visible.publication_batch_id -> publication_batches; actor columns -> actors.
// All these inherited relations are mandatory scope checks, including reads by ID.

export type Id = string; // Opaque generated Watermelon ID; not a name or source position.
export type Day = string; // Runtime validated Gregorian YYYY-MM-DD.
export type Instant = number; // Finite UTC epoch milliseconds.
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type TrackingType = 'weight_reps' | 'bodyweight' | 'weighted_bw' | 'assisted_bw'
  | 'duration' | 'weight_duration' | 'distance_duration' | 'legacy_unknown';
export type LoadBasis = 'external_total' | 'per_hand' | 'total_pair' | 'added_only' | 'assistance' | 'bodyweight' | 'unknown';
export type SetKind = 'working' | 'warmup' | 'drop' | 'failure' | 'legacy_unknown';
export type Scope = Readonly<{ workspaceId: Id; athleteId: Id; actorId: Id }>;
export type Expected = Readonly<{ entityId: Id; revision: number; headId: Id | null }>;
export type Nutrients = Readonly<{ energyKcal: number | null; proteinG: number | null;
  carbsG: number | null; fatG: number | null }>;
export type RawSetDraft = Readonly<{ load: string; reps: string; duration: string; distance: string;
  rpe: string; notes: string; kind: SetKind; locale: string; displayedLoadUnit: 'kg' | 'lb' }>;
export type SetValues = Readonly<{ trackingType: TrackingType; kind: SetKind; loadBasis: LoadBasis;
  loadKg: number | null; reps: number | null; durationS: number | null; distanceM: number | null;
  rpe: number | null; notes: string; performedAt: Instant | null }>;
export type Suggestion = Readonly<{ values: Omit<SetValues,'rpe' | 'notes' | 'performedAt'>;
  sourceDay: Day | null; sourceSessionId: Id | null; sourceSetId: Id | null; sourceRevision: number;
  sourceKind: 'routine' | 'previous' }>;
export type ServingBasis = Readonly<{ quantity: number; unit: string; gramsPerUnit: number | null;
  conversionEvidence: Json; definitionVersion: number }>;
// Nutrients describe the consumed quantity, already scaled once; not an extra per-basis multiplier.
export type FoodSnapshot = Readonly<{ label: string; quantity: number; unit: string;
  basis: ServingBasis; nutrients: Nutrients; source: Json; foodVersionId: Id | null;
  savedMealVersionId: Id | null }>;
export type FoodInput = Readonly<{ day: Day; timezone: string; meal: string;
  constituents: readonly FoodSnapshot[]; mealInstanceKey: string | null }>;
export type JointInput = Readonly<{ sessionId: Id; exerciseInstanceId: Id | null; setId: Id | null;
  location: string; side: 'left' | 'right' | 'bilateral' | 'unspecified';
  category: 'fatigue' | 'discomfort'; severity: number | null; severityScale: string | null; notes: string }>;
export type ImportChoice = Readonly<{ identityKey: string; decision: 'keep_current' | 'use_source' | 'exclude';
  nestedIdentityPolicy: 'retain_reviewed_mapping' | 'replace_ambiguous_graph' | null;
  expectedHeads: readonly Expected[] }>;
export type LegacyProvenance = Readonly<{ sourceNamespace:string; sourceRecordId:Json;
  acceptedContentHash:string; acceptedHeadsDigest:string; importerVersion:string; generation:number }>;
export type ImportResolution = { kind:'record'; choice:ImportChoice } |
  { kind:'timezone'; assumedTimezone:string } |
  { kind:'exercise_mapping'; sourcePath:string; exerciseId:Id | null;
    trackingType:TrackingType; loadBasis:LoadBasis } |
  { kind:'source_lineage'; sourceId:Id; confirmed:true };
export interface Payloads {
  StartSession: { source: { kind: 'empty' } | { kind: 'routine'; versionId: Id } |
    { kind: 'repeat'; sessionId: Id; headId: Id }; label: string; day: Day; timezone: string };
  EditSetDraft: { setId: Id; editorRevision: number; baselineHeadId: Id | null; raw: RawSetDraft };
  AddExercise: { sessionId: Id; exerciseId: Id | null; snapshot: Json; position: number };
  AddSet: { sessionId: Id; exerciseInstanceId: Id; suggestion: Suggestion | null; position: number };
  CompleteSet: { setId: Id; values: SetValues; suggestionSource: Suggestion | null;
    rest: { durationS: number; bootToken: string | null; monotonicAnchorMs: number | null } | null };
  AmendCompletedSet: { setId: Id; values: SetValues };
  UndoSetCompletion: { setId: Id };
  DeleteSet: { setId: Id };
  RestoreSet: { setId: Id; restoreObservationId: Id | null };
  SetSetType: { setId: Id; kind: SetKind };
  ReorderExercise: { sessionId: Id; orderedExerciseIds: readonly Id[] };
  SetSupersetGroup: { sessionId: Id; exerciseIds: readonly Id[]; groupKey: string | null };
  SaveSubjectiveObservation: { joint: JointInput; supersedesId: Id | null } |
    { rpe: number | null; sessionId: Id; exerciseInstanceId: Id | null; setId: Id | null };
  StartRestTimer: { sessionId: Id; durationS: number };
  ChangeRestTimer: { timerId: Id; deadlineAt: Instant };
  SkipRestTimer: { timerId: Id };
  FinishSession: { sessionId: Id; endedAt: Instant; retainUncompletedDrafts: boolean };
  AmendSession: { sessionId: Id; label: string; startedAt: Instant | null; endedAt: Instant | null;
    day: Day; timezone: string | null; notes: string };
  DiscardSession: { sessionId: Id; confirmed: true };
  LogFood: FoodInput;
  AmendFoodEntry: { entryId: Id; snapshot: FoodSnapshot; day: Day; timezone: string; meal: string };
  DeleteFoodEntry: { entryId: Id };
  RestoreFoodEntry: { entryId: Id; versionId: Id };
  SetDayCompleteness: { day: Day; status: 'in_progress' | 'complete';
    expectedEntryHeadsDigest: string; intentionalZeroEntryCoverage: boolean };
  RecordWeighIn: { weightKg: number; measuredAt: Instant; day: Day; timezone: string; source: Json };
  AmendWeighIn: { weighInId: Id; weightKg: number; measuredAt: Instant; day: Day; timezone: string };
  DeleteWeighIn: { weighInId: Id };
  SelectPrimaryWeighIn: { day: Day; weighInId: Id | null };
  PreviewLegacyImport: { localFileUri: string; formatHint: 'auto'; sourceId: Id | null;
    assumedTimezone: string | null };
  ResolveImportIssue: { jobId: Id; resolution: ImportResolution };
  CommitLegacyImport: { jobId: Id; expectedPreviewDigest: string };
}
export type CommandName = keyof Payloads;
export type Command<K extends CommandName = CommandName> = K extends CommandName ? Readonly<{
  name: K; scope: Scope; operationId: string; intendedAt: Instant;
  expected: readonly Expected[]; payload: Payloads[K];
}> : never;
export type CommandResult = Readonly<{ ids: readonly Id[]; heads: readonly Expected[];
  projectionWatermarks: Readonly<Record<string,number>>; importReconciliation?: Reconciliation }>;
export type Receipt = Readonly<{ operationId: string; payloadHash: string; committedAt: Instant;
  scope: Scope; result: CommandResult }>;
export type FailureCode = 'validation' | 'scope_denied' | 'revision_conflict' | 'operation_payload_mismatch'
  | 'disk_full' | 'database_unavailable' | 'database_corrupt' | 'source_missing' | 'preview_stale';
export type Outcome = { state: 'committed'; receipt: Receipt } |
  { state: 'rejected'; code: FailureCode; retryable: boolean; lastDurableDraftRevision: number | null } |
  { state: 'outcome_unknown'; operationId: string; recoveryRequired: true };
export interface Commands {
  execute<K extends CommandName>(command: Command<K>): Promise<Outcome>;
  lookupOperation(scope: Scope, operationId: string): Promise<Receipt | null>;
  recover(scope: Scope): Promise<readonly Outcome[]>;
}
export type Unsubscribe = () => void;
export interface ObservableQuery<T> { get(): Promise<T>; subscribe(onValue: (value:T)=>void,
  onError:(code:FailureCode)=>void): Unsubscribe }
export interface Page<T> { items: readonly T[]; nextCursor: string | null }
export type SetView = Readonly<{ id: Id; suggestion: Suggestion | null; draft: Row<'set_drafts'> | null;
  head: Row<'set_observations'> | null; pendingOperationId: string | null }>;
export interface Queries {
  activeSession(scope: Scope): ObservableQuery<Row<'sessions'> | null>;
  sessionDetail(scope: Scope, id: Id): ObservableQuery<{ session: Row<'sessions'>;
    version: Row<'session_versions'>; exercises: readonly Row<'session_exercises'>[] }>;
  exerciseRows(scope: Scope, exerciseInstanceId: Id): ObservableQuery<readonly SetView[]>;
  previousComparable(scope: Scope, context: ComparisonContext, beforeSessionId: Id): Promise<Comparison | null>;
  completedWeek(scope: Scope, reportingTimezone: string, today: Day): ObservableQuery<{
    monday: Day; sunday: Day; count: number; excludedAmbiguous: number }>;
  history(scope: Scope, cursor: string | null, limit: number): Promise<Page<Row<'session_versions'>>>;
  dietDay(scope: Scope, day: Day): ObservableQuery<{ entries: readonly Row<'food_entry_versions'>[];
    totals: Readonly<Record<keyof Nutrients,{ known:number; unknownContributors:number }>>;
    coverage: 'unlogged' | 'in_progress' | 'complete' }>;
  savedFoods(scope: Scope, search: string, cursor: string | null): Promise<Page<Row<'food_versions'>>>;
  usualFoods(scope: Scope, meal: string): Promise<readonly FoodSnapshot[]>;
  weighIns(scope: Scope, from: Day, through: Day): ObservableQuery<readonly Row<'weigh_in_versions'>[]>;
  trend(scope: Scope, through: Day): ObservableQuery<readonly TrendPoint[]>;
  importJob(scope: Scope, jobId: Id): ObservableQuery<{ job: Row<'import_jobs'>;
    reconciliation: Reconciliation | null }>;
  importIssues(scope: Scope, jobId: Id, cursor: string | null, limit: number): Promise<Page<Row<'import_items'>>>;
}
export interface ComparisonContext { exerciseId: Id; variant: string; equipment: string;
  loadBasis: LoadBasis; algorithmVersion: 'epley-v1'; eligibilityVersion: 'working-external-1to10-v1' }
export interface Comparison { currentKg: number; baselineKg: number; deltaKg: number;
  percent: number; currentDay: Day; baselineDay: Day; baselineSessionId: Id; context: ComparisonContext }
export interface TrendPoint { day: Day; representativeId: Id; measurementKg: number; trendKg: number;
  elapsedCalendarDays: number; alpha: number; method: 'ewma-half-life7-v1' }
export interface Reconciliation { sourceWorkouts: number; added: number; updated: number; skipped: number;
  quarantined: number; addedSets: number; sourceSetsInUpdates: number; netSetChange: number }
export type DomainEvent = Readonly<{ name: 'DraftCheckpointed' | 'SetCompletionCommitted' | 'SetAmended'
  | 'CompletionUndone' | 'TimerIntentCommitted' | 'SessionFinished' | 'FoodEntryCommitted'
  | 'DayCoverageChanged' | 'WeighInCommitted' | 'ImportProgress' | 'ImportCommitted'
  | 'OperationFailed' | 'OperationOutcomeUnknown' | 'SourceHistoryChanged';
  scope: Scope; operationId: string; heads: readonly Expected[]; watermark: number }>;

// Phase 2 transport wrappers. Server authenticates identity independently of this payload.
export type RawSyncRecord = Readonly<{ id: Id; [column: string]: string | number | boolean | null }>;
export type SyncChanges = Readonly<Record<string,{ created: readonly RawSyncRecord[];
  updated: readonly RawSyncRecord[]; deleted: readonly Id[] }>>;
export interface PullRequest { lastPulledAt: number | null; schemaVersion: number;
  migration: null | { from: number; tables: readonly string[];
    columns: readonly { table: string; columns: readonly string[] }[] };
  enrollmentId: string; accessEpoch: number }
export interface PullResponse { changes: SyncChanges; timestamp: number; accessEpoch: number }
export interface PushRequest { changes: SyncChanges; lastPulledAt: number;
  enrollmentId: string; accessEpoch: number; requestId: string; canonicalPayloadHash: string }
export interface SyncTransport { pull(request:PullRequest):Promise<PullResponse>;
  push(request:PushRequest):Promise<{ committed:true; requestId:string }> }
export type ArchiveTableName = Exclude<TableName,'access_grants' | 'identity_claims'>;
export type ArchiveRow<T extends ArchiveTableName> = T extends 'actors'
  ? Omit<Row<T>,'principal_id'> & { principal_id:null }
  : T extends 'workspaces' ? Omit<Row<T>,'claim_state'> & { claim_state:'unclaimed' } : Row<T>;
export interface NativeArchive { app:'body-dashboard-native'; formatVersion:1; schemaVersion:number;
  exportedAt:Instant; workspaceId:Id; athleteIds:readonly Id[];
  tables:{ readonly [K in ArchiveTableName]?: readonly ArchiveRow<K>[] };
  assets:readonly { logicalId:string; relativePath:string; mimeType:string; sha256:string }[];
  manifestSha256:string }
export interface ArchiveRepository {
  // Scope is validated by the application authority; a caller supplying IDs is not authorized.
  writeScopedArchive(scope:Scope, destinationLocalUri:string):Promise<{
    manifestSha256:string; recordCount:number; assetCount:number }>;
  inspectLocalArchive(sourceLocalUri:string):Promise<{ workspaceId:Id; athleteIds:readonly Id[];
    manifestSha256:string; compatible:boolean; issues:readonly string[] }>;
  restoreToIsolatedContainer(scope:Scope, sourceLocalUri:string, expectedManifestSha256:string):Promise<{
    containerId:string; recordCount:number; assetCount:number; authorityState:'unverified' }>;
}
