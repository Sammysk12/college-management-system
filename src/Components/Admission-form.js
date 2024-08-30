import React, { useState, useEffect } from 'react';
import './Admission-form-styling.css';

function AdmissionForm() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = {
    name: {
      required: true,
      trim: true,
      minLength: 3,
    },
    mobileNumber: {
      required: true,
      pattern: /^\d{10}$/,
      maxLength: 10,
    },
    address: {
      required: true,
      minLength: 10,
    },
    selectedClass: {
      required: true,
    },
    documents: {
      required: true,
      validator: (files) => files.length > 0 && files.every((file) => {
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        const extension = file.name.split('.').pop().toLowerCase();
        return allowedExtensions.includes(extension);
      }),
      error: 'Invalid file types or no documents uploaded. Please upload PDF, JPG, JPEG, or PNG files.',
    },
  };

  const validate = (schema, data) => {
    const errors = {};
    Object.keys(schema).forEach((field) => {
      const { required, pattern, maxLength, minLength, validator, error } = schema[field];
      const value = data[field];

      if (required && (!value || (Array.isArray(value) && value.length === 0))) {
        errors[field] = 'This field is required.';
        return;
      }

      if (pattern && !pattern.test(value)) {
        errors[field] = error || 'Invalid format.';
      }

      if (maxLength && value.length > maxLength) {
        errors[field] = `Maximum length exceeded. Please enter no more than ${maxLength} characters.`;
      }

      if (minLength && value.length < minLength) {
        errors[field] = `Minimum length not met. Please enter at least ${minLength} characters.`;
      }

      if (validator && value && !validator(value)) {
        errors[field] = error || 'Invalid value.';
      }
    });
    return errors;
  };

  useEffect(() => {
    setErrors(validate(validationSchema, { name, mobileNumber, address, selectedClass, documents }));
  }, [name, mobileNumber, address, selectedClass, documents]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    switch (id) {
      case 'name':
        setName(value.trim());
        break;
      case 'mobileNumber':
        setMobileNumber(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'selectedClass':
        setSelectedClass(value);
        break;
      default:
        break;
    }
    const updatedErrors = validate(validationSchema, { name, mobileNumber, address, selectedClass, documents });
    setErrors(updatedErrors);
  };

  const handleDocumentUpload = (event) => {
    const newDocuments = Array.from(event.target.files);
    setDocuments(newDocuments);

    validateDocuments(newDocuments)
      .then(() => setErrors((prevErrors) => ({ ...prevErrors, documents: '' })))
      .catch((error) => setErrors((prevErrors) => ({ ...prevErrors, documents: error.message || 'Document validation failed.' })));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const allErrors = validate(validationSchema, { name, mobileNumber, address, selectedClass, documents });
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      try {
        console.log('Form submitted:', { name, mobileNumber, address, selectedClass, documents });
        alert('Form submitted successfully!');
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors((prevErrors) => ({ ...prevErrors, general: 'An error occurred while submitting the form. Please try again later.' }));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const validateDocuments = async (documents) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (documents.some((file) => file.size > 1024 * 1024)) {
          reject(new Error('One or more documents exceed the maximum allowed size (1MB).'));
        } else {
          resolve();
        }
      }, 1000);
    });
  };

  return (
    <div className="admission-form">
      <h1>Admission Form</h1>
      <p>Fill in the details below to apply for admission.</p>

      <form onSubmit={handleSubmit}>
        <div className="formfield">
          <label htmlFor="name">
            Name:
            {errors.name && <span className="error">{errors.name}</span>}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleChange}
            maxLength={50}
          />

          <label htmlFor="mobileNumber">
            Mobile Number:
            {errors.mobileNumber && <span className="error">{errors.mobileNumber}</span>}
          </label>
          <input
            type="text"
            id="mobileNumber"
            value={mobileNumber}
            onChange={handleChange}
            maxLength={10}
          />

          <label htmlFor="address">
            Address:
            {errors.address && <span className="error">{errors.address}</span>}
          </label>
          <textarea
            id="address"
            value={address}
            onChange={handleChange}
          />

          <label htmlFor="selectedClass">
            Class:
            {errors.selectedClass && <span className="error">{errors.selectedClass}</span>}
          </label>
          <select
            id="selectedClass"
            value={selectedClass}
            onChange={handleChange}
          >
            <option value="">Select Class</option>
            <option value="BCA 1st">BCA 1st</option>
            <option value="MCA 1st">MCA 1st</option>
            <option value="MCA 2nd">MCA 2nd</option>
          </select>

          <label htmlFor="documents">
            Documents:
            {errors.documents && <span className="error">{errors.documents}</span>}
          </label>
          <input
            type="file"
            id="documents"
            multiple
            onChange={handleDocumentUpload}
          />

          <button type="submit" disabled={isSubmitting}>Submit</button>
          {errors.general && <div className="error">{errors.general}</div>}
        </div>
      </form>
    </div>
  );
}

export default AdmissionForm;
