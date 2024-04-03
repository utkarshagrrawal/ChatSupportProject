const { createClient } = require('@supabase/supabase-js')
require('dotenv').config();


const options = {
    db: {
        schema: 'public'
    }
}

const supabase = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_ANON_KEY, options)

module.exports = {
    supabase
}