-- Fix analyses INSERT policy: allow authenticated users to insert for own scans

DROP POLICY IF EXISTS "analyses_insert_service" ON analyses;

CREATE POLICY "analyses_insert_own"
  ON analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scans
      WHERE scans.id = analyses.scan_id
        AND scans.user_id = auth.uid()
    )
  );
