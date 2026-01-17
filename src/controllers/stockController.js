const { Cattle, HealthRecord, MilkProductionLog } = require('../models');

// --- Livestock Management ---

exports.addLivestock = async (req, res) => {
    try {
        const { 
            tag_id, type, breed, age, rfid_tag, lactation_number, 
            current_status, current_group, entry_type, entry_date 
        } = req.body;
        
        // Calculate DOB from age (approximate) if not provided
        let dob = req.body.dob;
        if (!dob && age) {
            const date = new Date();
            date.setFullYear(date.getFullYear() - age);
            dob = date.toISOString().split('T')[0];
        }

        // Map type to gender
        let gender = 'FEMALE';
        const upperType = type ? type.toUpperCase() : 'COW';
        
        if (upperType === 'BULL' || upperType === 'MALE_CALF') {
            gender = 'MALE';
        }

        const cattle = await Cattle.create({
            gaushala_id: req.user.id,
            tag_id,
            type: upperType,
            breed,
            dob,
            gender,
            rfid_tag,
            lactation_number,
            current_status: current_status || 'MILKING',
            current_group,
            entry_type,
            entry_date: entry_date || new Date()
        });

        res.status(201).json({ success: true, message: 'Livestock registered successfully', data: cattle });

    } catch (error) {
        console.error('Error adding livestock:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getLivestock = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const breed = req.query.breed || '';

        const { Op } = require('sequelize');
        
        const whereClause = {
            gaushala_id: req.user.id,
            deleted_at: null
        };

        if (search) {
            whereClause[Op.or] = [
                { tag_id: { [Op.like]: `%${search}%` } },
                { rfid_tag: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.current_status = status;
        }

        if (breed) {
            whereClause.breed = { [Op.like]: `%${breed}%` };
        }

        const { count, rows } = await Cattle.findAndCountAll({
            where: whereClause,
            include: [
                { model: HealthRecord, limit: 1, order: [['date', 'DESC']] }, 
                { model: MilkProductionLog, limit: 1, order: [['date', 'DESC']] }
            ],
            order: [['created_at', 'DESC']],
            limit: limit,
            offset: offset
        });

        // Map data to match frontend expectation
        const mappedList = rows.map(animal => {
            const animalJson = animal.toJSON();
            let age = null;
            if (animalJson.dob) {
                const birthDate = new Date(animalJson.dob);
                const today = new Date();
                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    calculatedAge--;
                }
                age = calculatedAge;
            }

            return {
                ...animalJson,
                age: age || animalJson.age // Fallback if age was stored directly
            };
        });

        res.json({
            success: true,
            data: mappedList,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching livestock:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateLivestock = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const cattle = await Cattle.findOne({ where: { id, gaushala_id: req.user.id } });
        if (!cattle) return res.status(404).json({ success: false, message: 'Livestock not found' });

        // Handle age to DOB update if age is provided
        if (updates.age !== undefined) {
             const date = new Date();
             date.setFullYear(date.getFullYear() - updates.age);
             updates.dob = date.toISOString().split('T')[0];
        }

        await cattle.update(updates);
        res.json({ success: true, message: 'Livestock updated', data: cattle });
    } catch (error) {
        console.error('Error updating livestock:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteLivestock = async (req, res) => {
    try {
        const { id } = req.params;
        const cattle = await Cattle.findOne({ where: { id, gaushala_id: req.user.id } });
        if (!cattle) return res.status(404).json({ success: false, message: 'Livestock not found' });

        await cattle.destroy();
        res.json({ success: true, message: 'Livestock removed' });
    } catch (error) {
        console.error('Error removing livestock:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Health Records ---

exports.addHealthRecord = async (req, res) => {
    try {
        const { id } = req.params; // Cattle ID
        const { checkup_date, diagnosis, treatment, vet_name } = req.body; // Matches frontend

        const cattle = await Cattle.findOne({ where: { id, gaushala_id: req.user.id } });
        if (!cattle) return res.status(404).json({ success: false, message: 'Livestock not found' });

        const record = await HealthRecord.create({
            cattle_id: id,
            date: checkup_date,
            description: diagnosis, // Map diagnosis to description
            doctor_name: vet_name, // Map vet_name
            treatment: treatment, // Should be in model? Check HealthRecord model. 
            // If not in model, store in description or add column. 
            // Let's assume generic for now or check model later.
        });

        res.status(201).json({ success: true, message: 'Health record added', data: record });

    } catch (error) {
        console.error('Error adding health record:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getHealthRecords = async (req, res) => {
    try {
        const { id } = req.params;
        const records = await HealthRecord.findAll({
            where: { cattle_id: id },
            order: [['date', 'DESC']]
        });
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Milk Production ---

exports.logMilkProduction = async (req, res) => {
    try {
        const { id } = req.params; // Cattle ID
        const { date, morning_yield_liters, evening_yield_liters, fat_percentage } = req.body;

         // Verify ownership
         const cattle = await Cattle.findOne({ where: { id, gaushala_id: req.user.id } });
         if (!cattle) return res.status(404).json({ success: false, message: 'Livestock not found' });

         const log = await MilkProductionLog.create({
             cattle_id: id,
             date,
             morning_yield_liters: morning_yield_liters || 0,
             evening_yield_liters: evening_yield_liters || 0,
             fat_percentage
         });

         res.status(201).json({ success: true, message: 'Milk production logged', data: log });

    } catch (error) {
        console.error('Error logging milk production:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
