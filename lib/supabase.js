import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://huyfrdybwavdhmusqgqr.supabase.co";
const supabaseKey = "sb_publishable_VnQ0RPP-DpeU0ManLVirwQ_pwumRZ6H";

export const supabase = createClient(supabaseUrl, supabaseKey);
