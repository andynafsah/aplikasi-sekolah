const fs = require('fs');

const path = 'src/lib/tu-server-data.ts';
let code = fs.readFileSync(path, 'utf8');

// Add meetings to DB definition
code = code.replace('bulletins: any[];', 'bulletins: any[];\n  meetings: any[];');
code = code.replace('bulletins: [],', 'bulletins: [],\n  meetings: [],\n  requests: [],\n  kopConfigs: {},');
code = code.replace('reminders: DocumentReminder[];', 'reminders: DocumentReminder[];\n  requests: any[];\n  kopConfigs: any;');

// Append route handlers
const routes = `
    case 'guestList': {
      const list = OfficeDB.guestBook.filter(g => g.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }
    case 'guestCreate': {
      const data = req.body;
      const newGuest = { ...data, id: 'GST-' + Date.now(), tenant_id: tenantId };
      OfficeDB.guestBook.unshift(newGuest);
      return res.json({ success: true, data: newGuest });
    }
    case 'meetingList': {
      const list = OfficeDB.meetings.filter(m => m.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }
    case 'requestList': {
      const list = OfficeDB.requests.filter(m => m.tenant_id === tenantId);
      return res.json({ success: true, data: list });
    }
`;

code = code.replace('    default:', routes + '\n    default:');
fs.writeFileSync(path, code);
